// Create a single supabase client for interacting with your database
import { createClient } from '@supabase/supabase-js'


const supabasePublicClient = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY, {
  db : {
    schema : "public"
  }
});
let messageForm = document.getElementById('messageForm');


console.log("loaded database.js")

// supabase select / insert functions
export async function getData() {
  try {
    const { data, error } = await supabasePublicClient
      .from('confessions-table')
      .select('*')
      if (error) {
        console.log(error);
      } else {
        return data;
      }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function insertData( msg) { 
  try {
    const { data, error } = await supabasePublicClient
    .from('confessions-table')
    .insert({'confession': msg.trim() })
    .select()
    
    if (error) {
      console.error("Error inserting data: ", error);
      throw new Error("Failed to save confession");
    }

    console.log(data, ": new message added");
    return data;
  } catch (error) {
    console.error("Error inserting data: ", error);
    throw new Error("Failed to insert confession");
  }
}

  // // RENDERING MESSAGES
  // export async function getMessageData() {
  //   const msgs = document.getElementById('msgs');
  //   msgs.empty() //remove all children elements
  //   let messages = await getData();
  //   for (let {message} of messages) {
  //     let messageTemplate = `
  //       <div style="position:absolute;left:${Math.random()*screen.width}px;top:${Math.random()*screen.height}px">
  //         <div>${message}</div>
  //       </div>
  //     `
  //     console.log('msg: ', messageTemplate);
  //     msgs.append(messageTemplate);
  //   }
  // }

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