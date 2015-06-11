
// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var socket = io.connect(api_root);

// PeerJS object
var peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3, config: {'iceServers': [
  { url: 'stun:stun.l.google.com:19302' } // Pass in optional STUN and TURN server for maximum network compatibility
]}});

var accessToken = {};
var peerId = '';
peer.on('open', function(){
	peerId = peer.id;
});

// Receiving a call
peer.on('call', function(call){
	// Answer the call automatically (instead of prompting user) for demo purposes
	call.answer(window.localStream);
	step3(call);
});
peer.on('error', function(err){
	alert(err.message);
	step2();
});

// receive call request, call back
socket.on('call', function(offer) {
	// fromUserId:
	// toUserId:
	// fromUserPeerId:
	
	if (accessToken && accessToken.userId && accessToken.userId == offer.toUserId) {
		if (confirm('User ' + offer.fromUserId + ' is call you.')) {
			step1(function() {
				var call = peer.call(offer.fromPeerId, window.localStream);
				step3(call);
			});
		}
	} 
});

// Click handlers setup
$(function(){
	$('#accessTokenButton_caller').click(function(){
		nlib.get(api_path+'/users/session?access_token=' + $('#accessToken').val(), function(status, data) {
			if (status == 200) {
				var response = JSON.parse(data);	
				if (response && response.accessToken && accessToken.id != response.accessToken.id) {
					accessToken = response.accessToken;
					$('#my-id').text(accessToken.userId);
					step1(); // open video and hide accessToken Box
				}
			}
		});
	});
	
	$('#accessTokenButton_receiver').click(function(){
		nlib.get(api_path+'/users/session?access_token=' + $('#accessToken').val(), function(status, data) {
			if (status == 200) {
				var response = JSON.parse(data);	
				if (response && response.accessToken && accessToken.id != response.accessToken.id) {
					accessToken = response.accessToken;
					$('#my-id').text(accessToken.userId);
					step2(); // hide accessToken Box
				}
			}
		});
	});

	$('#make-call').click(function(){
		if (accessToken && accessToken.userId) {
			var offer = {
				fromUserId:  accessToken.userId,
				toUserId: parseInt($('#callto-id').val()),
				fromPeerId: peerId
			};
			socket.emit('call', offer);
		}
	});


	$('#end-call').click(function(){
		window.existingCall.close();
		step2();
	});
});

// open video camera
function step1 (callback) {
  // Get audio/video stream
  navigator.getUserMedia({audio: true, video: true}, function(stream){
	// Set your video displays
	$('#my-video').prop('src', URL.createObjectURL(stream));

	window.localStream = stream;
	step2();
	if (callback) {
		callback();
	}
  }, function(){ $('#step1-error').show(); });
}

// close
function step2 () {
	$('#step1, #step3').hide();
	$('#step2').show();
}

// make call
function step3 (call) {
  // Hang up on an existing call if present
  if (window.existingCall) {
	window.existingCall.close();
  }

  // Wait for stream on the call, then set peer video display
  call.on('stream', function(stream){
	$('#their-video').prop('src', URL.createObjectURL(stream));
  });

  // UI stuff
  window.existingCall = call;
  $('#their-id').text(call.peer);
  call.on('close', step2);
  $('#step1, #step2').hide();
  $('#step3').show();
}