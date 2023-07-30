const firebaseConfig = {
    apiKey: "AIzaSyBED3d1-cLAwWrbQJsH0LJBU1A3iDQbBi0",
    authDomain: "bigbern-erp.firebaseapp.com",
    databaseURL: "https://bigbern-erp-default-rtdb.firebaseio.com",
    projectId: "bigbern-erp",
    storageBucket: "bigbern-erp.appspot.com",
    messagingSenderId: "129741589367",
    appId: "1:129741589367:web:2dfd5bf29e5936bdd1af72",
    measurementId: "G-L3T956JGTM"
};


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";


// Initialize Firebase
initializeApp(firebaseConfig);

// Import the functions you need from the SDKs you need
  import { getDatabase, ref, child,onValue, get }
  from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

//   for department
const db = getDatabase();
const departments=[]
function GetDataRealTime (){
    const dbRef = ref(db,'departmentForm');
    onValue(dbRef,(snapshot)=>{
        snapshot.forEach(childSnapshot =>{
            departments.push( childSnapshot.val());
        });
    });
} 
GetDataRealTime ()


function toogle (){
    document.querySelector('#toggle').classList.toggle('hidden')
}
//target appraisee name
// document.getElementById('EmployeeName').addEventListener('change',(e)=>{
//     department.filter(dpt=>{
//      return dpt.name.toLowerCase().includes(e.target.value.toLowerCase()); 
//     }).filter(y=>{

//         document.getElementById('manger').value= y.manager;
//         document.getElementById('department').value= y.Hod;
//         document.getElementById('role').value= y.manager;
//         document.getElementById('email').value= y.manager;
//     })
   
// })
// setting option values for department
setTimeout(()=>{
    departments.forEach((department)=>{
        let options = document.createElement('option');
            options.value= department.departmentName;
            document.getElementById('department').appendChild(options)
    })
},5000)
// add eventlistner for datalist department
let dataList = document.getElementsByName('sdepartment')[0];
dataList.addEventListener('change',(e)=>{
   departments.filter(dpt=>{
        return dpt.departmentName.toLowerCase().includes(e.target.value.toLowerCase());
    }).filter(depart=>{
        // target form input and set values to select manager and hod automatically
        document.getElementById('manager').value = depart.manager;
        // display value to show members of a department
        depart.units.forEach(person=>{
            // render each department members name
                let options = document.createElement('option');
                options.value= person.name;
                document.getElementById('appraisee').appendChild(options)
                document.getElementById('email').value= person.email
        })
        // let persondataList = document.getElementsByName('Appraised')[0]
        // persondataList.addEventListener('change',(e)=>{
           
        // })
        
    })
})
console.log(departments)


// submit form to table
let submitBtn = document.getElementById('submit')
var conNumber = 0;
document.querySelector('form').addEventListener('submit',(e)=>{
        const Apraisals=[];
        e.preventDefault();
        const d = new Date()
        function Apraisal (){
            this.score = e.target.elements.score.value;
            this.innovation = e.target.elements.innovation.value;
            this.Measures = e.target.elements.Measures.value;
            this.Perspective = e.target.elements.Perspective.value;
            this.Objectives = e.target.elements.Objectives.value;
            this.AprasalDate = `${String(d.getDate() + 1).padStart(2,'0')}/${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear()}`;
        }
        Apraisals.unshift(new Apraisal())
        Apraisals.forEach((kpi)=>{
            var tbody =document.querySelector('#tbody');
            let trow = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            let td3 = document.createElement('td');
            let td4 = document.createElement('td');
            let td5 = document.createElement('td');
            let td6 = document.createElement('td');
        
            td1.innerText = ++conNumber;
            td6.innerText=kpi.Perspective
            td3.innerText= kpi.Objectives;
            td2.innerText= kpi.Measures;
            td5.innerText= `${kpi.score}%`;
            td4.innerText= kpi.innovation;

            trow.appendChild(td1);
            trow.appendChild(td6);
            trow.appendChild(td3);
            trow.appendChild(td2);
            trow.appendChild(td5);
            trow.appendChild(td4);
            tbody.appendChild(trow);
        })
        document.querySelector('form').reset()
    });


    submitBtn.addEventListener('click',()=>{
});