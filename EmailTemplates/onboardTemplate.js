module.exports = function Onboarded (data,handelPassword,handelOps){
    return(`
    
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
	<style>
		
		.center {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			padding: 10px;
			}

            .image{
                border:1px solid grey;
                padding:20px;
                background-image: url("https://mail.google.com/mail/u/0?ui=2&ik=f5437c25fe&attid=0.1&permmsgid=msg-a:r7650817176752635353&th=18a9d6f479d41527&view=fimg&fur=ip&sz=s0-l75-ft&attbid=ANGjdJ_7XiONh9Wv7_lXkxMPSKPeXVu3yfM-bhQP7-lVnNSCmkq9Ij-oFtQhYVwyiMI9dyrqZVBewoK_WS5o17wn8mfurOX8dGrKyv_HNeodI0HX0q7z4TiDMwsba2U&disp=emb&realattid=ii_lmluxsf30");
                width:90px;
                height:90px;
                display:none;
            }
	</style>
</head>
<body>
   
<div class="center">
	<div>
    <div class="image "></div>
    </div> 
	<h4>Congratulations ${data.firstName} ${data.lastName}, you have been sucessfully Onboarded <br>Cheers..!</h4>
    <h6>Your Login Email is ${data.Email}, default password is ${handelPassword}. We advice that you <a href="https://bade.GK.onrender.com/login">Reset your Password</a></h6>
	<h5>Defaul operational code ${handelOps}. Treat as Secret</h5>
	<p> &copy; BADE</p>
</div>

</body>
</html>
    `)
}