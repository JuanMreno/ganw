(function($) {

	var VAL_SERV = ":3000/externals/validate";
	var SERVER_IP_COOKIE = "SERVER_IP_COOKIE";
	var ips = [];
	var win = nw.Window.get();

  	$.cookie.json = true;
	var servIpCookie = $.cookie(SERVER_IP_COOKIE);

  	//win.showDevTools();
  	win.maximize();

	$body = $('body');
	$dialog = $('#dialog');
	$ipServCont = $('#ipServerCont');
	$ipServCont.hide();

	$iFrame = $('<iframe  style="width: 100%; height: 100%; display: inline-block; position: absolute; top: 0; bottom: 0; left: 0; right: 0;"></iframe >')

	console.log(localStorage.ipServer);
	if(localStorage.ipServer !== undefined){
		findServerOnce(localStorage.ipServer,false);
		
		//$iFrame.attr('src', servIpCookie.url);
		//$body.append($iFrame);
	}
	else{
		findServer();
	}
	//$body.append($iFrame);

	function findServer() {
		lookingForServDialog();

		var exec = require('child_process').exec, child;

		child = exec('arp -a',
			function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error !== null) {
			         console.log('exec error: ' + error);
			    }

			    ipsExtract(stdout);
			    console.log(ips);

			    if(ips.length > 0){
			    	validateIp(ips[0]);
			    }
			    else{
				    console.log("Servidor no encontrado.");
				    servNotFoundDialog();
			    }
		});
	}

	function findServerOnce(ip,loader) {
		if(loader)
			lookingForServDialog();

		$.ajax({
			url: "http://" + ip + VAL_SERV,
			data:{},
			timeout: 5000
		})
		.done(function( data ) {
			
			var res = $.parseJSON(data);

			if(res.status == "true"){
				console.log("Servidor encontrado: " + ip);
				$.cookie(SERVER_IP_COOKIE,{url:"http://" + ip + ":3000/"});

				localStorage.ipServer = ip;
				$iFrame.attr('src', "http://" + ip + ":3000/");
				$body.append($iFrame);
			}
			else{
				console.log("Servidor no encontrado.");
		    	servNotFoundDialog();
			}
			//alert("Nombre o Usuario inválido, intenta de nuevo.")
			//clearInterval(loadIntervaId);
			//$.cookie(SESSION_COOKIE, {id:"1",name:"Oscar Moreno",rol:"pro-rol",rolName:"Profesor"});
			//goToMain();
		})
		.error(function(e) {
			console.log("Error ajax.");
			console.log("Servidor no encontrado.");
		    servNotFoundDialog();
		});
	}

	function ipsExtract(res) {
	    var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/; 
		var t;

		if(res.match(r)){
			t = res.match(r);
			while(t !== null){
				console.log(t[0]);
				ips.push(t[0]);

				res = res.replace(t[0],'');
				t = res.match(r);
			} 
		}
		else{
			console.log("Servidor no encontrado.");
		    servNotFoundDialog();
		}
	}

	function validateIp(ip) {
		$.ajax({
			url: "http://" + ip + VAL_SERV,
			data:{},
			timeout: 5000
		})
		.done(function( data ) {
			
			var res = $.parseJSON(data);

			if(res.status == "true"){
				console.log("Servidor encontrado: " + ip);
				$.cookie(SERVER_IP_COOKIE,{url:"http://" + ip + ":3000/"});

				localStorage.ipServer = ip;
				$iFrame.attr('src', "http://" + ip + ":3000/");
				$body.append($iFrame);
			}
			else{
				ips.splice(0, 1);
				validateNext();
			}
			//alert("Nombre o Usuario inválido, intenta de nuevo.")
			//clearInterval(loadIntervaId);
			//$.cookie(SESSION_COOKIE, {id:"1",name:"Oscar Moreno",rol:"pro-rol",rolName:"Profesor"});
			//goToMain();
		})
		.error(function(e) {
			console.log("Error ajax.");
			ips.splice(0, 1);
			validateNext();
		});
	}

	function validateNext() {
		if(ips.length > 0){
			validateIp(ips[0]);
		}
		else{
			console.log("Servidor no encontrado.");
		    servNotFoundDialog();
		}
	}

	function lookingForServDialog() {
		$ipServCont.hide();
		$dialog.find('#dialogMns').text('Buscando el servidor...');
		$dialog.prop('open', true);
	}

	function servNotFoundDialog() {
		$dialog.find('#dialogMns').text('Servidor no encontrado.');
		$dialog.prop('open', true);

		$ipServCont.show();
		$('#ipServer').val('');

		$('#ipServerSubmit').off('click').on('click', function(event) {
			event.preventDefault();
			
			$input = $('#ipServer');
			console.log($input.val());

			if($input.val() != '')
				findServerOnce($input.val(),true);
		});

	}
})(jQuery);