// Create a single supabase client for interacting with your database
import { createClient } from '@supabase/supabase-js'

const supabasePublicClient = createClient('https://ipkmrzmkpptefejihfuv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa21yem1rcHB0ZWZlamloZnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMTA0NDAsImV4cCI6MjA0Nzc4NjQ0MH0.rudtYng7igTEVkC1lyV0ebzt66WiU7sEa3Jmun2crXQ', {
  db : {
    schema : "public"
  }
});
let messageForm = document.getElementById('messageForm');


console.log("loaded database.js")

// supabase select / insert functions
export async function getData() {
  const { data, error } = await supabasePublicClient
    .from('confessions-table')
    .select('*')
  if (error) {
    console.log(error);
  } else {
    return data;
  }
}

export async function insertData( msg) { 
  const { data, error } = await supabasePublicClient
  .from('confessions-table')
  .insert({'confession': msg })
  .select()

  if (error) {
    console.log(error);
  } else {
    console.log(data, ": new message added");
    getMessageData();
  }
}

  // RENDERING MESSAGES
  export async function getMessageData() {
    const msgs = document.getElementById('msgs');
    msgs.empty() //remove all children elements
    let messages = await getData();
    for (let {message} of messages) {
      let messageTemplate = `
        <div style="position:absolute;left:${Math.random()*screen.width}px;top:${Math.random()*screen.height}px">
          <div>${message}</div>
        </div>
      `
      console.log('msg: ', messageTemplate);
      msgs.append(messageTemplate);
    }
  }

// SUBMISSION
// messageForm.bind("submit", (e) => {
//   e.preventDefault();
//   console.log('submitting...')
//   // handle submit
//   let message = document.getElementById("textInput").value;
  
//   insertData( message )
//   messageForm.trigger("reset") // resets form inputs
// });


// $( document ).ready(function () {
//   getMessageData();
// }) 