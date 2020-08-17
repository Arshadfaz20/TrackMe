$('#navbar').load('navbar.html');
$('#footer').load('footer.html');

const API_URL = 'http://localhost:5000/api';

const currentUser = localStorage.getItem('user');
if (currentUser) {
  $.get(`${API_URL}/users/${currentUser}/devices`)
  .then(response => {
    response.forEach((device) => {
      $('#devices tbody').append(`
        <tr data-device-id=${device._id}>
          <td>${device.user}</td>
          <td>${device.name}</td>
        </tr>`
      );
    });
    $('#devices tbody tr').on('click', (e) => {
      const deviceId = e.currentTarget.getAttribute('data-device-id');
      $.get(`${API_URL}/devices/${deviceId}/device-history`)
      .then(response => {
        console.log(response);
        response.map(sensorData => {
          $('#historyContent').append(`
          <tr>
          <td>${sensorData.ts}</td>
          <td>${sensorData.temp}</td>
          <td>${sensorData.loc.lat}</td>
          <td>${sensorData.loc.lon}</td>
          </tr>
          `);
         }); 
         $('#historyModal').modal('show');        
      });
    });
  })
  .catch(error => {
  console.error(`Error: ${error}`);
  });
 }  else {
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/registration' )
     { location.href = '/login'; }
}
 

const devices = JSON.parse(localStorage.getItem('devices')) || [];
const users = JSON.parse(localStorage.getItem('users')) || [];

const response = $.get(`${API_URL}/devices`);
console.log(response);

$('#add-device').on('click', () => {
  const name = $('#name').val();
  const user = $('#user').val();
  const sensorData = [];
  const body = {
  name,
  user,
  sensorData
  };
  $.post(`${API_URL}/devices`, body)
  .then(response => {
  location.href = '/';
  })
  .catch(error => {
  console.error(`Error: ${error}`);
  });
 });
 
 
 $('#login').on('click', () => {
  const user = $('#user').val();
  const password = $('#password').val();
  $.post(`${API_URL}/authenticate`, { user, password })
  .then((response) =>{
  if (response.success) {
  localStorage.setItem('user', user);
  localStorage.setItem('isAdmin', response.isAdmin);
  localStorage.setItem('isAuthenticated', true);
  location.href = '/';
  } else {
  $('#message').append(`<p class="alert alert-danger">${response}
 </p>`);
  }
  });
 });
 
 $('#register').on('click', function() {
  const user = $('#user').val();
  const password = $('#password').val();
  const confirm = $('#confirm').val();
  if (password === confirm){
    if (user == '' || password == ''){
      document.getElementById("message").innerHTML = "Username or password cannot be empty";
    } else{
      $.post(`${API_URL}/registration`, { user, password, isAdmin: 1 })
      .then((response) =>{
        if (response.success) {
          location.href = '/login';
        } else {
          $('#message').append(`<p class="alert alert-danger">${response}</p>`);
        }
      });
    }
    
  }
  else{
    document.getElementById("message").innerHTML = "Passwords do not match";
  }

});
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
 
  }

   $('#send-command').on('click', function() {
    const command = $('#command').val();
    console.log(`command is: ${command}`);
   });
   
