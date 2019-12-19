/// <reference path="jquery-2.1.1.min.js" />

var VAR_counter;    // Counter for moving vehicle on counter value
var OBJ_detailsFromAjax;        // Common Object to get details from Ajax call

var BLN_loading = true;         // Based on this value alert message will display/hide
var BLN_onPageRestart = false;  // IF false then vehicle moving without any interval(Time)

// start: Map related boolean, variable, array, and icon
var BOL_vehicleStatusColorChange = false;       // When status of Vehicle Status Color Change

var VAR_markerPosition = "c";                   // To set marker position(Center/ Fit/ Move) on center of Google Map
var VAR_tempIneterval = undefined;
// Transparent icon: used for hiding polyline icon
var OBJ_iconTransparent = {
  path: 'M 40 20 L 80 20 L 100 40 L 100 140 L 20 140 L 20 40 Z',
  anchor: new google.maps.Point(60, 10),
  scale: 0.15,
  strokeWeight: 1,
  fillOpacity: 0.9,
  fillColor: 'transparent',
  strokeColor: 'transparent'
};

var tempDrawnStartLastLocation = [];

var OBJ_marker;                     // Marker(Vehicle)
var OBJ_googleMap;                  // Google Map
var OBJ_currentPolyline;            // Current Polyline at current situation
var OBJ_sourceMarker = undefined;   // Source Marker
var OBJ_destinMarker = undefined;   // Destination Marker
var OBJ_fitBounds = undefined;      // Fit source and destination markers on map
var dataPlotInfo = "";
var dataInvoice = "";
var dataGeofence = [];

//  ARY: Array
var ARY_delay = [];               // Array of Delay(interval time) path point(Location) and details
var ARY_points = [];              // Array of path point(Location) to drawing on current situation
var ARY_Polyline = [];            // Array of Polyine path point(Location)
var ARY_drawCoords = [];          // Array of drawing path point(Location) and details
var ARY_drawPolyline = [];        // Array of object (Polyline, Draw Points, Color)
var ARY_invoiceMarker = [];              // Array of invoice source and destination marker
var ARY_icon = [
  { icon: 'images/s3.png' },
  { icon: 'images/l3.png' }];               // source, and Last location icon
// end: Map related variable

//  FN: Function
function FN_moveVehicle() {
  if (BLN_pause === true) {
    if (ARY_drawCoords.length > VAR_counter) {
      var currentLat;
      var currentLng;
      try {
        currentLat = parseFloat(ARY_drawCoords[(VAR_counter)].Latitude);
      }
      catch (err) { if (VAR_counter > 0) { currentLat = parseFloat(ARY_drawCoords[VAR_counter - 1].Latitude); } }
      try {
        currentLng = parseFloat(ARY_drawCoords[(VAR_counter)].Longitude);
      }
      catch (err) { if (VAR_counter > 0) { currentLng = parseFloat(ARY_drawCoords[VAR_counter - 1].Longitude); } }
      var Movelatlng = new google.maps.LatLng(currentLat, currentLng);
      var delayMiliseconds = 50;
      if (dataInvoice !== "") {
        var selRow = dataInvoice.find(function (data) {
          if (tempDrawnStartLastLocation.length === 0)
            return data.InvoiceNo === ARY_drawCoords[VAR_counter].InvoiceNo;
          else {
            var len = tempDrawnStartLastLocation.find(function (cr) {
              return cr === data.InvoiceNo
            });
            if (len === undefined)
              return data.InvoiceNo === ARY_drawCoords[VAR_counter].InvoiceNo
          }
        });
      }
      else {
        $('#mapParent').removeClass('col-md-8').addClass('col-md-12');
        $('#invoiceParent').html('');
      }
      if (selRow !== undefined) {
        tempDrawnStartLastLocation.push(selRow.InvoiceNo);
        if (tempDrawnStartLastLocation.length === dataInvoice.length) {
          FN_drawMarkerAndInfoWindow(selRow, true);
        }
        else {
          FN_drawMarkerAndInfoWindow(selRow, false);
        }
        //$('#dateInvoiceDetailsDiv').slideDown(0);
        //$('#dateInvoiceNo').text(selRow.InvoiceNo);
        //$('#dateValidityFrom').text(selRow.ValidityFrom + " - " + selRow.ValidityUpto);
        //$('#dateDistance').text(selRow.Distance + ' Km');
        //$('#dateQuantity').text(selRow.Quantity + ' Brass');
        //$('#dateMaterial').text(selRow.Material);
        //$('#datePlotName').text(selRow.PlotName.length > 36 ? selRow.PlotName.substr(0, 33) + '...' : selRow.PlotName).attr('title', selRow.PlotName);
        //$('#datedestination').text(selRow.Destination.length > 36 ? selRow.Destination.substr(0, 33) + '...' : selRow.Destination).attr('title', selRow.Destination);
      }


      var status = ARY_drawCoords[VAR_counter].VehicleStatus;
      if (BOL_vehicleStatusColorChange == false) {
        var color;
        VAR_vehicleStatusColorChangeColor = status;
        BOL_vehicleStatusColorChange = true;
        ARY_points.push({ "lat": currentLat, "lng": currentLng });
        switch (status) {
          case 1: color = '#26B86F'; //green
            break;
          case 2: color = '#ED4345'; //red
            break;
          case 3: color = '#FBB917'; //orange
            break;
          case 4: color = '#228CC0'; //blue
            break;
          default: color = '#363636'; //Gray
        }
        var tempPolyline = new google.maps.Polyline({
          map: OBJ_googleMap,
          path: [{ lat: currentLat, lng: currentLng }],
          ARY_icon: [{
            icon: OBJ_iconTransparent
          }],
          strokeColor: color,
          strokeOpacity: 1,
          strokeWeight: 4,
          zIndex: VAR_counter + 1000
        });
        ARY_Polyline.push({ 'polyline': tempPolyline });
        OBJ_currentPolyline = tempPolyline;
      }
      else {
        if (VAR_vehicleStatusColorChangeColor != ARY_drawCoords[VAR_counter].VehicleStatus) {
          ARY_points.push({ "lat": currentLat, "lng": currentLng });
          ARY_Polyline[ARY_Polyline.length - 1].polyline.setPath(ARY_points);
          var tempPoints = ARY_points.slice();
          ARY_points.splice(0);
          ARY_drawPolyline.push({ 'polyline': OBJ_currentPolyline, 'drawPoints': tempPoints, 'colorCode': ARY_drawCoords[VAR_counter - 1].VehicleStatus });
          OBJ_currentPolyline = "";
          ARY_points.push({ "lat": currentLat, "lng": currentLng });
          BOL_vehicleStatusColorChange = false;
        }
        else {
          ARY_points.push({ "lat": currentLat, "lng": currentLng });
          ARY_Polyline[ARY_Polyline.length - 1].polyline.setPath(ARY_points);
          OBJ_fitBounds.extend(Movelatlng);
        }
      }
    }
    VAR_counter++;
    if (VAR_counter === 1) {
      var selectedRow = ARY_drawCoords[0];
      var currentLatS = parseFloat(selectedRow['Latitude']);
      var currentLngS = parseFloat(selectedRow['Longitude']);
      var PlotInfo = "";
      var tempPlotInfo = "";
      if (dataInvoice.length > 0) {
        if (dataInvoice != "") {
          htmlContent = '';
          dataInvoice.sort(function (cr, nxt) {
            return nxt.RowNumber - cr.RowNumber
          })
          dataInvoice.map(function (selRowIn, ind) {
            htmlContent += '<tr data-invoice="' + selRowIn.InvoiceNo + '"><td>' + (ind + 1) + '</td><td>' + (selRowIn.InvoiceNo) + '</td><td>' + (selRowIn.ValidityFrom + " - " + selRowIn.ValidityUpto) + '</td><td>' + selRowIn.Distance + '</td><td>' + selRowIn.Quantity + '</td><td>' + selRowIn.Material + '</td><td>' + selRowIn.PlotName + '</td><td>' + selRowIn.Destination + '</td></tr>';
          })
          $('#InvoiceData tbody').html(htmlContent);
        }
      }
      if (dataGeofence.length > 0) {
        dataGeofence.forEach(function (cr) {
          var drawPolygonCoordsString = cr.PolygonText;
          var CoordsString = drawPolygonCoordsString.split('),(');
          CoordsString.map(function (current) {
            var drawPolygonCoords = [];
            var res = current.replace(/\)|\(/g, "");
            res = res.split(',');
            res.map(function (data) {
              drawPolygonCoords.push(data.split(' '));
            });

            contentString = "<table>";
            var tempString = cr.GeofenceName === null ? '-' : cr.GeofenceName;
            contentString += '<tr><td>GeoFence</td><td><strong>&nbsp;:&nbsp;' + tempString + '<strong></td></tr>';
            tempString = cr.PlotType === null || cr.PlotType === "" ? " - " : cr.PlotType;
            contentString += '<tr><td>Plot</td><td><strong>&nbsp;:&nbsp;(&nbsp;' + tempString;
            tempString = cr.PlotName === null || cr.PlotName === "" ? "-" : cr.PlotName;
            contentString += '&nbsp;)&nbsp;' + tempString + '</strong></td></tr>';
            tempString = cr.State === null || cr.State === "" ? "-" : cr.State;
            contentString += '<tr><td>State, Division</td><td><strong>&nbsp;:&nbsp;' + tempString;
            tempString = cr.Division === null || cr.Division === "" ? "-" : cr.Division;
            contentString += ',&nbsp;' + tempString + '</strong></td></tr>';
            tempString = cr.District === null || cr.District === "" ? "-" : tempString;
            contentString += '<tr><td>District, Taluka, Village </td><td><strong>&nbsp;:&nbsp;' + tempString;
            tempString = cr.Taluka === null || cr.Taluka === "" ? "-" : cr.Taluka;
            contentString += ',&nbsp;' + tempString;
            tempString = cr.Village === null || cr.Village === "" ? "-" : cr.Village;
            contentString += ',&nbsp;' + tempString + '</strong></td></tr>';
            tempString = cr.OwnerName === null || cr.OwnerName === "" ? "-" : cr.OwnerName;
            contentString += '<tr><td>Owner</td><td><strong>&nbsp;:&nbsp;' + tempString + ' ( ';
            tempString = cr.OwnerMobileNo === null || cr.OwnerMobileNo === "" ? "-" : cr.OwnerMobileNo;
            contentString += tempString + ' )</strong></td></tr>';
            tempString = cr.OwnerAddress === null || cr.OwnerAddress === "" ? "" : cr.OwnerAddress;
            contentString += '<tr><td>Owner address </td><td><strong>&nbsp;:&nbsp;' + tempString + ' </strong></td></tr>';
            tempString = cr.DurationFrom === null || cr.DurationFrom === "" ? "-" : cr.DurationFrom;
            contentString += '<tr><td>Duration </td><td><strong>&nbsp;:&nbsp;' + tempString;
            tempString = cr.DurationTo === null || cr.DurationTo === "" ? "-" : cr.DurationTo;
            contentString += ' - ' + tempString + '</strong></td></tr></table>';

            var infowindowDP = new google.maps.InfoWindow({
              content: contentString
            });

            var PolyCoords = [];
            drawPolygonCoords.map(function (data) {
              if (Number(data[1]) && Number(data[0])) {
                PolyCoords.push({ "lat": Number(data[1]), "lng": Number(data[0]) });
              }
              //console.log(data[1] + ',' + data[0]);
            });

            // Construct the polygon.
            var drawPolygon = new google.maps.Polygon({
              paths: PolyCoords,
              strokeColor: "#EF7626",
              strokeOpacity: 1,
              strokeWeight: 3,
              fillColor: "#EF7626",
              fillOpacity: 0.2,
            });
            var centerPoint = FN_CN_poly2latLang(drawPolygon);
            var drawPolygonMarker = new google.maps.Marker({
              position: centerPoint,
              map: OBJ_googleMap,
              title: cr.PlotName,
              label: {
                text: 'GF',
                color: 'white',
                weight: 'bold',
              }
            });
            drawPolygonMarker.addListener('click', function (event) {
              infowindowDP.open(OBJ_googleMap, drawPolygonMarker);
            });

            drawPolygon.setMap(OBJ_googleMap);
            google.maps.event.addListener(drawPolygon, 'click', function (event) {

              infowindowDP.open(OBJ_googleMap, this);
              infowindowDP.setPosition(event.latLng);
            });
            //ARY_GF_district.push({ 'draw': drawPolygon });
          })
        })
      }
      var contentString ='';
      cr = ARY_drawCoords[0];
      contentString = "<table><tbody>";

      var tempString = cr.VehicleNumber === null || cr.VehicleNumber === "" ? '-' : cr.VehicleNumber;
      contentString += '<tr><td>Vehicle no.</td><th>&nbsp;:&nbsp;' + tempString + '</td></tr>';

      tempString = cr.DeviceDatetime === null ? '-' : cr.DeviceDatetime;
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
      if (currentLatS != 0 && currentLatS != null && currentLngS != 0 && currentLngS != null) {
        var Sourcelatlng = new google.maps.LatLng(currentLatS, currentLngS);

        var locationInfowindow = new google.maps.InfoWindow({
          content: contentString
        });
        OBJ_sourceMarker = new google.maps.Marker({
          position: Sourcelatlng,
          map: OBJ_googleMap,
          icon: {
            url: ARY_icon[0].icon,
            anchor: new google.maps.Point(19, 24)
          },
          offset: '100%',
          title: "Source location",
          infowindow: locationInfowindow
        });
        google.maps.event.addListener(OBJ_sourceMarker, 'click', function () {
          this.infowindow.open(OBJ_googleMap, this);
        });
      }
      selectedRow = ARY_drawCoords[ARY_drawCoords.length - 1];
      currentLatS = parseFloat(selectedRow['Latitude']);
      currentLngS = parseFloat(selectedRow['Longitude']);
      if (currentLatS != 0 && currentLatS != null && currentLngS != 0 && currentLngS != null) {
        var Destinationlatlng = new google.maps.LatLng(currentLatS, currentLngS);

        cr = ARY_drawCoords[ARY_drawCoords.length - 1];
        contentString = "<table><tbody>";

        var tempString = cr.VehicleNumber === null || cr.VehicleNumber === "" ? '-' : cr.VehicleNumber;
        contentString += '<tr><td>Vehicle no.</td><th>&nbsp;:&nbsp;' + tempString + '</td></tr>';

        tempString = cr.DeviceDatetime === null ? '-' : cr.DeviceDatetime;
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


        var locationInfowindow = new google.maps.InfoWindow({
          content: contentString
        });
        OBJ_destinMarker = new google.maps.Marker({
          position: Destinationlatlng,
          map: OBJ_googleMap,
          icon: {
            url: ARY_icon[1].icon,
            anchor: new google.maps.Point(19, 24)
          },
          offset: '100%',
          title: "Last location",
          optimized: false,
          zIndex: 101,
          infowindow: locationInfowindow
        });
        google.maps.event.addListener(OBJ_destinMarker, 'click', function () {
          this.infowindow.open(OBJ_googleMap, this);
        });
      }
    }
    if (VAR_counter === (ARY_drawCoords.length - 1)) {
      var currentLat = parseFloat(ARY_drawCoords[VAR_counter].Latitude);
      var currentLng = parseFloat(ARY_drawCoords[VAR_counter].Longitude);
      var Movelatlng = new google.maps.LatLng(currentLat, currentLng);
      ARY_points.push({ "lat": currentLat, "lng": currentLng });
      ARY_Polyline[ARY_Polyline.length - 1].polyline.setPath(ARY_points);
      OBJ_googleMap.fitBounds(OBJ_fitBounds);
    }
    else {
      FN_moveVehicle();
    }
  }
  else {
    FN_moveVehicle();
  }
}
function FN_initialize() {
  ARY_points = [];
  var latlng = new google.maps.LatLng(19.0898177, 76.5240298);
  OBJ_googleMap = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 9,
    center: latlng
  });
  OBJ_googleMap.panTo(latlng);
  OBJ_fitBounds = new google.maps.LatLngBounds();
}                       // On document ready, initialize function triggered 
function FN_drawMarkerAndInfoWindow(selRow, isSetMap) {
  var currentLatS = parseFloat(selRow.SourceLat);
  var currentLngS = parseFloat(selRow.SourceLong);
  if (currentLatS !== 0 && currentLatS !== null && currentLngS !== 0 && currentLngS !== null) {
    var Sourcelatlng = new google.maps.LatLng(currentLatS, currentLngS);
    var infoContent = '<table>';
    infoContent += '<tr><td colspan="2"><h5 style="margin: 0px; border-bottom: solid 1px #c1c1c1; padding-bottom: 3px;"><strong>Owner & plot details</strong></h5></td></tr>';
    infoContent += '<tr><td>Owner</td><td><strong>&nbsp;:&nbsp;' + (selRow.PlotOwnerName === "" ? "-" : selRow.PlotOwnerName) + ' ( ' + (selRow.PlotOwnerMobileNo === "" ? "-" : selRow.PlotOwnerMobileNo) + ' )' + '</strong></td></tr>';
    infoContent += '<tr><td>Plot name</td><td><strong>&nbsp;:&nbsp;' + (selRow.PlotName === "" ? "-" : selRow.PlotName) + '</strong></td></tr>';
    infoContent += '<tr><td>Duration</td><td><strong>&nbsp;:&nbsp;' + selRow.PlotDurationFrom + ' - ' + selRow.PlotDurationTo + '</strong></td></tr>';
    //infoContent += '<tr><td>Address</td><td><strong>&nbsp;:&nbsp;' + (selRow.PlotOwnerAddress === "" ? "-" : selRow.PlotOwnerAddress) + '</strong></td></tr>';
    //infoContent += '<tr><td>Mob.</td><td><strong>&nbsp;:&nbsp;' + (selRow.PlotOwnerMobileNo === "" ? "-" : selRow.PlotOwnerMobileNo) + '</strong></td></tr>';
    infoContent += '<tr><td colspan="2"><h5 style="margin-bottom: 0px; border-bottom: solid 1px #c1c1c1; padding-bottom: 3px;"><strong>Invoice details</strong></h5></td></tr>';
    infoContent += '<tr><td>Invoice no.</td><td><strong>&nbsp;:&nbsp;' + (selRow.InvoiceNo === "" ? "-" : selRow.InvoiceNo) + '</strong></td></tr>';
    infoContent += '<tr><td>Validity</td><td><strong>&nbsp;:&nbsp;' + (selRow.ValidityFrom === "" ? "-" : selRow.ValidityFrom) + ' - ' + (selRow.ValidityUpto === "" ? "-" : selRow.ValidityUpto) + '</strong></td></tr>';
    infoContent += '<tr><td>Source</td><td><strong>&nbsp;:&nbsp;' + (selRow.PlotName === "" ? "-" : selRow.PlotName) + '</strong></td></tr>';
    infoContent += '<tr><td>Destination</td><td><strong>&nbsp;:&nbsp;' + (selRow.Destination === "" ? "-" : selRow.Destination) + '</strong></td></tr>';
    infoContent += '<tr><td>Distance</td><td><strong>&nbsp;:&nbsp;' + (selRow.Distance === "" ? "-" : selRow.Distance) + ' Km</strong></td></tr>';
    infoContent += '<tr><td>Material</td><td><strong>&nbsp;:&nbsp;' + (selRow.Material === "" ? "-" : selRow.Material) + '</strong></td></tr>';
    infoContent += '<tr><td>Quantity</td><td><strong>&nbsp;:&nbsp;' + (selRow.Quantity === "" ? "-" : selRow.Quantity) + ' Brass</strong></td></tr>';
    infoContent += '</table>';
    var locationInfowindow = new google.maps.InfoWindow({
      content: infoContent
    });
    var OBJ_sourceMarker = new google.maps.Marker({
      position: Sourcelatlng,
      title: selRow.PlotName,
      label: {
        text: 'S' + tempDrawnStartLastLocation.length,
        color: 'white',
        weight: 'bold',
      },
      infowindow: locationInfowindow
    });
    if (isSetMap) {
      OBJ_sourceMarker.setMap(OBJ_googleMap, OBJ_sourceMarker)
    }
    ARY_invoiceMarker[ARY_invoiceMarker.length] = { 'marker': OBJ_sourceMarker, 'invoice': selRow.InvoiceNo }
    google.maps.event.addListener(OBJ_sourceMarker, 'click', function () {
      this.infowindow.open(OBJ_googleMap, this);
    });
  }
  var currentLatD = parseFloat(selRow.DestiLat);
  var currentLngD = parseFloat(selRow.DestiLong);
  if (currentLatD !== 0 && currentLatD !== null && currentLngD !== 0 && currentLngD !== null) {
    var destinationlatlngD = new google.maps.LatLng(currentLatD, currentLngD);
    var locationInfowindowD = new google.maps.InfoWindow({
      //content: '<table><tr><td>Destination</td><td><strong>&nbsp;:&nbsp;' + selRow.Destination + '</strong></td></tr><tr><td>LatLong</td><td><strong>&nbsp;:&nbsp;' + currentLatD + ', ' + currentLngD + '</strong></td></tr></table>'
      content: infoContent
    });
    var OBJ_destinMarker = new google.maps.Marker({
      position: destinationlatlngD,
      title: selRow.PlotName,
      label: {
        text: 'D' + tempDrawnStartLastLocation.length,
        color: 'white',
        weight: 'bold',
      },
      infowindow: locationInfowindowD
    });
    if (isSetMap) {
      OBJ_destinMarker.setMap(OBJ_googleMap, OBJ_destinMarker)
    }
    ARY_invoiceMarker[ARY_invoiceMarker.length] = { 'marker': OBJ_destinMarker, 'invoice': selRow.InvoiceNo }
    google.maps.event.addListener(OBJ_destinMarker, 'click', function () {
      this.infowindow.open(OBJ_googleMap, this);
    });
  }
}
// Returns Center latLang of passed Polygon(poly) i.e. GeoFence
function FN_CN_poly2latLang(poly) {
  var lowx,
    highx,
    lowy,
    highy,
    lats = [],
    lngs = [],
    vertices = poly.getPath();
  for (var i = 0; i < vertices.length; i++) {
    lngs.push(vertices.getAt(i).lng());
    lats.push(vertices.getAt(i).lat());
  }
  lats.sort();
  lngs.sort();
  lowx = lats[0];
  highx = lats[vertices.length - 1];
  lowy = lngs[0];
  highy = lngs[vertices.length - 1];
  center_x = lowx + ((highx - lowx) / 2);
  center_y = lowy + ((highy - lowy) / 2);
  return (new google.maps.LatLng(center_x, center_y));
}
$(window).resize(function () {
  var vh = window.innerHeight;
  $('#map_canvas').height((vh - 24) + 'px');
})
$(document).ready(function () {
  FN_initialize();
  var vh = window.innerHeight;
  $('#map_canvas').height((vh - 24) + 'px');
  var dataFromURL = location.search;
  dataFromURL = dataFromURL.substr(1);
  dataFromURL = dataFromURL.split('&');
  try {
    var dataToSend = {
      "Id": dataFromURL[0],
      "Unit": dataFromURL[1],
    }
    $.ajax({
      type: "POST",
      url: 'http://generalgpsservice.mahamining.com/service.asmx/getGPRSDetails',
      //data: JSON.stringify(dataToSend),
      data: dataToSend,
      //contentType: "application/json; charset=utf-8",
      //dataType: "json",
      //processdata: true,
      success: function (json) {
        if (JSON.parse(json).data === "0") {
          OBJ_detailsFromAjax = JSON.parse(json).data1;
        } else {
          OBJ_detailsFromAjax = 'Data Not Found...';
        }
      },
      error: function () {
        OBJ_detailsFromAjax = "error";
      }
    });

    var tempInterval = setInterval(function () {
      if (OBJ_detailsFromAjax) {
        if (OBJ_detailsFromAjax.length === 0) {
          //alert(OBJ_detailsFromAjax.data[0].InvalidMsg);
          alert('No Data Found...', false);
          //$('#dateHideShowDetailsUL,#dateInvoiceDetailsDiv').slideUp();
        }
        else {
          dataCord = OBJ_detailsFromAjax;
          //dataPlotInfo = OBJ_detailsFromAjax.PlotInfo;
          //dataInvoice = OBJ_detailsFromAjax.invoice;
          //dataGeofence = OBJ_detailsFromAjax.Geofence;
          if (dataCord) {
            ARY_drawCoords = dataCord;
            VAR_counter = 0;
            BLN_pause = true;
            if (ARY_drawCoords.length > 1) {
              FN_moveVehicle();
            }
            else {
              alert('No Data Found...', false);
            }
          }
          else {
            alert(OBJ_detailsFromAjax);
          }
        }
        OBJ_detailsFromAjax = "";
        clearInterval(tempInterval);
      }
    }, 50)
  }
  catch (e) {
    alert('No data found');
  }
})  // Document ready
window.addEventListener("resize", function () {
  var vh = window.innerHeight;
  $('#map_canvas').height((vh - 24) + 'px');
})  // Browser resize
$(document).on('click', '#InvoiceData tbody tr', function () {
  var ts = $(this);
  ARY_invoiceMarker.map(function (cr) {
    cr.marker.setMap(null);
  })
  var aryM = ARY_invoiceMarker.filter(function (cr) {
    return cr.invoice === +$(ts).data('invoice')
  })
  aryM.map(function (cr) {
    cr.marker.setMap(OBJ_googleMap, cr.marker);
  })
})
