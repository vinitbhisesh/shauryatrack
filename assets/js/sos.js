/// <reference path="jquery-2.1.1.min.js" />
window.addEventListener("resize", function () {
  var vh = window.innerHeight;
  $('#dvMap').height((vh - 80) + 'px');
});

var map;
var ARY_marker = [];
var icons;
var infoWindow = new google.maps.InfoWindow();

function bindMarkers(markers) {
  setInterval(function () {
    if (ARY_marker.length > 0) {
      ARY_marker.forEach(function (cr) {
        cr.draw.setMap(null);
      })
      ARY_marker.length = 0;
    }
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < markers.length; i++) {
      var data = markers[i];
      var myLatlng = new google.maps.LatLng(data.Latitude, data.Longitude);
      var marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: myLatlng,
        labelAnchor: new google.maps.Point(18, 12),
        map: map,
        icon: icons[1],
        title: data.description
      });
      var infoWin = new google.maps.InfoWindow({
        content: data.description
      })
      bounds.extend(myLatlng);
      ARY_marker.push({ "draw": marker, "infoWindow": infoWin, "mobileno": data.mobileNo });
      (function (marker, cr) {
        google.maps.event.addListener(marker, "click", function (e) {
          contentString = "<table><tbody>";

          var tempString = cr.VehicleNumber === null || cr.VehicleNumber === "" ? '-' : cr.VehicleNumber;
          contentString += '<tr><td>Vehicle no.</td><th>&nbsp;:&nbsp;' + tempString + '</td></tr>';

          tempString = cr.DeviceDateTime === null ? '-' : cr.DeviceDateTime;
          contentString += '<tr><td>DateTime</td><th>&nbsp;:&nbsp;' + tempString + '</th></tr>';

          tempString = cr.Latitude + ', ' + cr.Longitude;
          contentString += '<tr><td>Latlng</td><th>&nbsp;:&nbsp;' + tempString + '</th></tr>';

          tempString = cr.VehicleOwnerName === null || cr.VehicleOwnerName === "" ? '-' : cr.VehicleOwnerName;
          contentString += '<tr><td>Owner</td><th>&nbsp;:&nbsp;' + tempString + '</th></tr>';

          tempString = cr.MobileNo === null || cr.MobileNo === "" ? '-' : cr.MobileNo;
          contentString += '<tr><td>Mobile no</td><th>&nbsp;:&nbsp;' + tempString + '</th></tr>';

          //var tempString = cr.PoliceStationName === null || cr.PoliceStationName === "" ? '-' : cr.PoliceStationName;
          //contentString += '<tr><td>Police station</td><th>&nbsp;:&nbsp;' + tempString + '</th></tr>';

          contentString += '</tbody></table>';

          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });
      })(marker, data);
    }
    map.fitBounds(bounds);
  }, 10000)
}

$(document).ready(function () {
  var vh = window.innerHeight;
  icons = [
    {
      "url": "../assets/img/police_location.png", // url
      "scaledSize": new google.maps.Size(40, 40)
    },
    {
      "url": "../assets/img/loader1.gif", // url
      "scaledSize": new google.maps.Size(60, 60)
    },
    {
      "url": "../assets/img/train_location.png", // url
      "scaledSize": new google.maps.Size(40, 40)
    }];
  $('#dvMap').height((vh - 80) + 'px');

  var mapOptions = {
    center: new google.maps.LatLng(22.3109498, 73.1782126),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var infoWindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);

  $.ajax({
    "type": "POST",
    "url": "http://generalgpsservice.mahamining.com/service.asmx/getSOSAlert_Dashboard",
    "data": '',
    "success": function (res) {
      var dataFromSrvr = JSON.parse(res);
      var data1 = dataFromSrvr.data1;
      bindMarkers(data1);
    },
    "error": function () {
    }
  })
})
