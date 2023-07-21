//DATABASE SHIT STARTS HERE
//FROM BIG BERN 
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

import { getDatabase, ref, child,onValue, get,}
from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import { initializeApp} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
// initialize firebase
const app = firebase.initializeApp(firebaseConfig);
initializeApp(firebaseConfig);

// get auto replenish option
// document.getElementById('toggleReplenish').addEventListener('change',(e)=>{
//     if(e.checked){
//         setTimeout(() => {
//             document.getElementById('mode').classList.remove('hidden');
//             if (document.querySelector('input[name="replenish"]')){
//                 document.querySelectorAll('input[name="replenish"]').forEach((elem)=>{
//                     elem.addEventListener('change',(e)=>{
//                         if(form.value === 'date'){
//                         setTimeout(() => {
//                             document.getElementById('date').classList.remove('hidden');
//                         }, 1000);
//                         }else{
//                         setTimeout(()=>{
//                             document.getElementById('date').classList.add('hidden');
//                         },1000);
//                         }
            
//                         if(form.value === 'quantity'){
//                         setTimeout(() => {
//                             document.getElementById('quantity').classList.remove('hidden');
//                         }, 1000);
//                         }else{
//                         setTimeout(() => {
//                             document.getElementById('quantity').classList.add('hidden');
//                         }, 1000);
//                         }
//                     });
//                 });
//             }
//         }, 1000);
//     }else if(!e.checked){
//         setTimeout(() => {
//             document.getElementById('mode').classList.add('hidden');
//             document.getElementById('quantity').classList.add('hidden');
//             document.getElementById('date').classList.add('hidden');
//             document.querySelector('input[name="replenish"]').checked = false;
//         }, 1000);
//     }
// });


const ActivateProduct = document.getElementById('ActivateProduct')
ActivateProduct.addEventListener("change",(e) =>console.log(e.target.checked))

// form image 
var files = [];
document.getElementById("files").addEventListener("change", function(e) {
    files =  e.target.files;
    for (let i = 0; i < files.length; i++) {
    }
    //checks if files are selected
    if (files.length != 0) {
      //Loops through all the selected files
      for (let i = 0; i < files.length; i++) {
        //create a storage reference
        var storage = firebase.storage().ref(`product photo/${files[i].name}`);
  
        //upload file
        var upload = storage.put(files[i])
  
        //update progress bar
        upload.on(
          "state_changed",alert('Image Selected')
          // function progress(snapshot) {
          //   var percentage =
          //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          //   document.getElementById("progress").value = percentage;
          // },
        );
      }
    } else {
      alert("No file chosen");
    }
  
    upload.then(snapshot => {
         return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
     }).then(downloadURL => {
      // set image url for form
      document.getElementById('imageLoader').value = `${downloadURL}`;
      
      // display image on form
      document.getElementById('productImage').style.backgroundImage = `url(${downloadURL})`;
      
     }).catch(error => {
        // Use to signal error if something goes wrong.
        alert(`Failed to upload file and get link - ${error}`);
     });
   
  });

const productcode = Math.floor(Math.random()*1322300)

// targeting the form 
var ProductForm = document.getElementById('productForm');
ProductForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
   
        const Name = ProductForm.Name.value;
        const category = ProductForm.category.value;
        const image = ProductForm.image.value;
        const WareHouse_Price = ProductForm.WareHouse_Price.value;
        const Market_Price = ProductForm.Market_Price.value;
        const Van_Price = ProductForm.Van_Price.value;
        const Vendor = ProductForm.vendor.value;
        const vendor_Price = ProductForm.vendor_Price.value;
        const UMO = ProductForm.UMO.value;
        const color = ProductForm.elements.color.value;
        const Description = ProductForm.Description.value;
        const ACDcode = ProductForm.AdcCode.value;
        const Sellable =  ProductForm.Sellable.checked;
        const Ecom_sale = ProductForm.Ecom_sale.checked;
        const Manufacturer = ProductForm.Manufacturer.value;
        const product_code = `${productcode}-${ProductForm.Name.value}`;
        const Manufacture_code = ProductForm.ManufacturerCode.value;
        const VAT = ProductForm.VAT.value;
    
        const endPoint= '/Product/Create-new';
        const res = await fetch(endPoint,{
            body:JSON.stringify({Name,
                category,
                image, 
                WareHouse_Price,
                Market_Price,
                Van_Price,
                vendor_Price,
                Vendor,
                UMO,
                color,
                Description,
                Sellable,
                Ecom_sale,
                Manufacturer,
                Manufacture_code,
                product_code,
                ACDcode,
                VAT}),
            method:'POST',
            headers:{'Content-Type': 'application/json'}
        })

        const data = await res.json()
        console.log(data)
});

