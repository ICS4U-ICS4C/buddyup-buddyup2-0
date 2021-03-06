/*
----Purpose----
Update messages on the browser
----Idea(ends)-----
Add html value from firebase to the browser
*/
    // ---Function(s)--- //
    function writeToBrowser(htmlStructure, objToWriteTo) {
      htmlStructure.forEach((m) => {
        document.querySelector(objToWriteTo).innerHTML += m
      })
    }

    // ---Main program--- // (Note, is in setTimeout to make sure uid loads properly)
    setTimeout(async () => {
      // ---Declare variables--- //
      const rootMessages = firebase.database().ref(sessionStorage.getItem('chat'))
      const rootDm = firebase.database().ref('Private/')
      var getOld = true
      var ignoreNew = false
      var fetchLatest = false
      var fetchold = true
      var user;

      // ---ALL GENRAL MESAGES--- //
      // ---update sent message--- //
      rootMessages.limitToLast(1).on("child_added", async (snapshot) => {
        await firebase.database().ref('Users/' + firebase.auth().currentUser.uid).on('value',async function(elem) {
          user = elem.val().name
          if (ignoreNew) {
            document.querySelector('.discussion').innerHTML += snapshot.val().messageToDisp
            var objDiv = document.querySelector(".discussion");
            objDiv.scrollTop = objDiv.scrollHeight;
            //Sets the ready by with current user if their current tab is meet and they are in a group
            if (sessionStorage.getItem('cTab') == 'meet') {
              if (sessionStorage.getItem('cTab') == 'meet' && sessionStorage.getItem('chat') != 'general') {
                if (snapshot.val().readby.split(" ").indexOf(user) == -1) {
                  await firebase.database().ref(`${sessionStorage.getItem('chat')}/${snapshot.key}/readby`).set(`${snapshot.val().readby} ${user}`)
                }
              }
            }
            getOld = false
          }
        })
      })

      await rootMessages.on('child_added', async snapshot => {
        await firebase.database().ref('Users/' + firebase.auth().currentUser.uid).on('value',async function(elem) {
          user = elem.val().name
          if (getOld) {
            document.querySelector('.discussion').innerHTML += snapshot.val().messageToDisp
            var objDiv = document.querySelector(".discussion");
            objDiv.scrollTop = objDiv.scrollHeight;
            //Sets the ready by with current user if their current tab is meet and they are in a group
            if (sessionStorage.getItem('cTab') == 'meet' && sessionStorage.getItem('chat') != 'general') {
              if (snapshot.val().readby.split(" ").indexOf(user) == -1) {
                await firebase.database().ref(`${sessionStorage.getItem('chat')}/${snapshot.key}/readby`).set(`${snapshot.val().readby} ${user}`)
              }
            }
            ignoreNew = false
          }
        })
      })

      // ---ALL PRIVATE MESSAGES--- //

      await rootDm.limitToLast(1).on("child_added", async snapshot => {
        await firebase.database().ref('Users/' + firebase.auth().currentUser.uid).on('value',async function(elem) {
          user = elem.val().name
          if (fetchLatest) {
            if (snapshot.val().sendTo == user || snapshot.val().sender == user) {
              document.querySelector('.discussion').innerHTML += snapshot.val().messageToDisp
              var objDiv = document.querySelector(".discussion");
              objDiv.scrollTop = objDiv.scrollHeight;
              if (sessionStorage.getItem('cTab') == 'meet' && snapshot.val().sendTo == user) {
                await firebase.database().ref(`Private/${snapshot.key}/checked`).set(true)
              }
            }
            fetchold = false
          }
        })
      })

      await rootDm.on("child_added", async snapshot => {
        await firebase.database().ref('Users/' + firebase.auth().currentUser.uid).on('value',async function(elem) {
          user = elem.val().name
          if (fetchold) {
            if (snapshot.val().sendTo == user || snapshot.val().sender == user) {
              document.querySelector('.discussion').innerHTML += snapshot.val().messageToDisp
              var objDiv = document.querySelector(".discussion");
              objDiv.scrollTop = objDiv.scrollHeight;
              if (sessionStorage.getItem('cTab') == 'meet' && snapshot.val().sendTo == user) {
                await firebase.database().ref(`Private/${snapshot.key}/checked`).set(true)
              }
            }
            fetchLatest = true
          }
        })
      })
    }, 1700)
