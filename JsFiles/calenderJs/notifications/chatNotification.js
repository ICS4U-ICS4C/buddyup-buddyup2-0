/*
  ---Purpose---
  To add chat notification to notification tab
  ---How it works---
  If the user is not on the meet tab and they get a private message or group messages, it means they have not read it
  This mean that they should get a notification
  ---Steps and logic---
  1. Determine what tab they are on
     Scripts only run on htmls pages that link them
     So we really don't have to determine what tab there in

  2.Determine when a notification is added to firebase
    Using firebase's .on child_added we can determine when a notification was added and on browser load
      Child_added gives individual children
      Ommiting the use of a forloop
    When we get a child value we look at it's child readby or checked depending on the type of message

    If chat is a private messages and checked is false we add it as a notification
    When user closes it we update it to be true so that it does not keep on appering

    For group we check in readby to see if the the active user is apart of readby
    If they are not then we send them notification of meesage
    When close button is hit on the add_notification_remove script it adds the user's name to readby
*/

/* ---Opening and closing of notification panel--- */
let hid = true
$('.close').click(function(){
  if(hid){
    document.querySelector('.notification-panel').style.transform = "translateX(0%)"
    hid = false
  }else{
    document.querySelector('.notification-panel').style.transform = "translateX(100%)"
    hid = true
  }
})

setTimeout(async ()=>{
  // ---Declare variables--- //
  const rootMessages = firebase.database().ref(sessionStorage.getItem('chat'))
  const rootDm = firebase.database().ref('Private/')
  var getOld = true
  var ignoreNew = false
  var fetchLatest = false
  var fetchold = true
  // ---General messages/Group messages--- //
  // ---update sent message--- //
  rootMessages.limitToLast(1).on("child_added", async (snapshot) => {
    if (ignoreNew) {
        if (sessionStorage.getItem('chat') != 'general') {
          if (snapshot.val().readby.split(" ").indexOf(active_user) == -1) {
            let message = `${snapshot.val().messageToDisp.split(`<h2 class="message">`)[1].split('</h2>')[0]}`
            message = message.replace(/\s+/g,' ').split(" ").join(" ")
            let senderName = `${sessionStorage.getItem('chat').split('/')[1]} ${sessionStorage.getItem('chat').split('/')[2].split("group").join("Group ")}`
            //Third argument is the key value for the message, applies to all notification's, this allow us to easily index in firebase
            addNotification(message, senderName,`${sessionStorage.getItem('chat')}/${snapshot.key}/readby`,false,'gr_chat')
          }
        }
      getOld = false
    }

  })

  await rootMessages.on('child_added', async snapshot => {
    if (getOld) {
      if (sessionStorage.getItem('chat') != 'general'){
        if (snapshot.val().readby.split(" ").indexOf(active_user) == -1){
          let message = `${snapshot.val().messageToDisp.split(`<h2 class="message">`)[1].split('</h2>')[0]}`
          message = message.replace(/\s+/g,' ').split(" ").join(" ")
          let senderName = `${sessionStorage.getItem('chat').split('/')[1]} ${sessionStorage.getItem('chat').split('/')[2].split("group").join("Group ")}`
          addNotification(message, senderName,`${sessionStorage.getItem('chat')}/${snapshot.key}/readby`,false,'gr_chat')
        }
      }
      ignoreNew = false
    }
  })

  // ---ALL PRIVATE MESSAGES--- //
  await rootDm.limitToLast(1).on("child_added", async snapshot => {
    if (fetchLatest) {
      if (snapshot.val().sendTo == active_user || snapshot.val().sender == active_user) {
        if (snapshot.val().sendTo == active_user && !snapshot.val().checked) {
          let senderName = `Message from ${snapshot.val().messageToDisp.split(`<h2 class="name">`)[1].split('</h2>')[0]}`
          let message = `${snapshot.val().messageToDisp.split(`<h2 class="message">`)[1].split('</h2>')[0]}`
          message = message.split(" ").join(" ").replace(/\s+/g,' ').split(" ").slice(2,message.split(" ").join(" ").replace(/\s+/g,' ').split(" ").length - 1).join(" ")
          addNotification(message, senderName,`Private/${snapshot.key}/checked`,false,'p_chat')
        }
      }
      fetchold = false
    }
  })

  await rootDm.on("child_added", async snapshot => {
    if (fetchold){
      if (snapshot.val().sendTo == active_user || snapshot.val().sender == active_user) {
        if (snapshot.val().sendTo == active_user && !snapshot.val().checked){
          let senderName = `Message from ${snapshot.val().messageToDisp.split(`<h2 class="name">`)[1].split('</h2>')[0]}`
          let message = `${snapshot.val().messageToDisp.split(`<h2 class="message">`)[1].split('</h2>')[0]}`
          message = message.split(" ").join(" ").replace(/\s+/g,' ').split(" ").slice(2,message.split(" ").join(" ").replace(/\s+/g,' ').split(" ").length - 1).join(" ")
          addNotification(message, senderName,`Private/${snapshot.key}/checked`,false,'p_chat')
        }
      }
      fetchLatest = true
    }
  })
}, 1700)
