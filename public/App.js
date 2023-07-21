
let Active_userId = null
// display login div on window page load if active user is not registered
if (Active_userId == null){
    window.onload= setTimeout(() => {
        loginDiv.classList.remove('hidden')
    }, 3000);
    setTimeout(() => {
        loginDiv.classList.add('hidden')
    }, 20000);
}


let theme = localStorage.getItem('theme')//to setup local storage
// check local storage for last mode set
theme == null ? setTheme('yellow'):setTheme(theme);


//regulate checked for mode
if(theme === 'black'){
    document.getElementById('ToogleMode').checked = true;
}

function setTheme(mode){
    if (mode == 'black'){
        document.getElementById('theme-style').href='Dark.css'
        document.getElementById('mode').innerText = `Dark Mode`;
    }
    if (mode == 'yellow'){
        document.getElementById('theme-style').href='yellow.css'
        document.getElementById('mode').innerText = `Light Mode`
    }
    localStorage.setItem('theme', mode);//to save theme to local storage
}

//dark mode toggle button
document.getElementById('ToogleMode').addEventListener('change',(e)=>{
    e.target.checked ? setTheme('black') :setTheme('yellow');
})
