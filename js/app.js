//Define global map and markers variables
            var map;
            var markers = [];
            //Our view, locations that we'll display
            var locations = [{
                title: "California State Capital",
                image: 'img/capital.jpg',
                content: 'Hello',
                location: {
                    lat: 38.576828, 
                    lng: -121.493605
                },
            },
            {
                title: "Old Sacramento State Historic Park",
                location: {
                    lat: 38.583689, 
                    lng: -121.503856
                },
            },
            {
                title: "Sutter's Fort",
                location: {
                    lat: 38.572417, 
                    lng: -121.471106
                },
            },
            {
                title: "Crocker Art Museum",
                location: {
                    lat: 38.577130, 
                    lng: -121.505998,
                },
            },
            {
                title: "Tower Bridge California",
                location: {
                    lat: 38.580721, 
                    lng: -121.508011,
                },
            },
            {
                title: "California Automobile Museum",
                location: {
                    lat: 38.570475, 
                    lng: -121.511816,
                },
            },
            {
                title: "The Sacramento Bee",
                location: {
                    lat: 38.580550, 
                    lng: -121.494843,
                },
            },
            {
                title: "Sacramento Masonic Temple",
                location: {
                    lat: 38.580151, 
                    lng: -121.491164,
                },
            },
            {
                title: "California State Railroad Museum",
                location: {
                    lat: 38.584863, 
                    lng: -121.504125,
                },
            }, 
            {
                title: "Governor's Mansion State Historic Park",
                location: {
                    lat: 38.580317, 
                    lng: -121.484769,
                },
            }

        ];

            //Initialize map and markers
            function initMap() {
            // Constructor creates a new map - only center and zoom are required.
                map = new google.maps.Map(document.getElementById('map'), {
                    //Set center of map
                    center: {lat: 38.576661, lng: -121.493637},
                    zoom: 13
                }); 
                //
                //Create infowindow
                var largeInfowindow = new google.maps.InfoWindow();
                maxWidth: 200;
                //Create bounds that will be displayed on map
                var bounds = new google.maps.LatLngBounds();
                //Loop through our locations and display our markers
                for (var i = 0; i < locations.length; i++) {
                    //Get our position from our array of locations
                    var content = locations[i].content;
                    var title = locations[i].title;
                    var position = locations[i].location;
                    //Create new markers where their locations are at
                    var marker = new google.maps.Marker({
                        title: title,
                        map: map,
                        position: position,
                        animation: google.maps.Animation.DROP,
                    });
                //Push markers to the map
                markers.push(marker);
                locations[i].marker = marker;
                //Extend our map to where markers are
                bounds.extend(marker.position);
                //Open infowindow when marker is clicked
                marker.addListener('click', function() {
                    populateInfoWindow(this, largeInfowindow);
                    toggleBounce(this, marker);
                })  

            }

            //Function to display infowindow
             function populateInfoWindow(marker, infowindow) {
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;
                    //Make infowindow close on second click
                    infowindow.addListener('closeclick', function() {
                        infowindow.setMarker(null);
                    })
                    var streetViewService = new google.maps.StreetViewService();
                    var radius = 50;

                    function getStreetView(data, status) {
                        if (status == google.maps.StreetViewStatus.OK) {
                            var nearStreetViewLocation = data.location.latLng;
                            var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                            //Possibly set infowindow here?
                            var panoramaOptions = {
                                position: nearStreetViewLocation,
                                pov: {
                                    heading: heading,
                                    pitch: 30
                                }
                            };
                            var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                        } else {
                            infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found!</div');
                        }
                        
                    }


                    //Create wiki url with our search string inside:
                    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title;


                    //Create ajax request object
                    $.ajax({
                        url: wikiUrl,
                        dataType: "jsonp",
                        success: function( response ) {
                            var wikiStr = response[1];
                            var wikipediaURL = 'http://en.wikipedia.org/wiki/' + wikiStr;
                            infowindow.setContent('<h2>' + marker.title + '</h2>' + '</div><div id="pano"></div>' + '<p>' + '<a href="' + wikipediaURL + '">' + '</p><p>' + response[2] + '</p>');
                            infowindow.open(map, marker);
                            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

                        },
                        error: function(msg) {
                            console.log(msg);
                        }

                    });
                }

            }           

            //Fit map to bounds
            map.fitBounds(bounds);
            //Make markers bounce when clicked!
            function toggleBounce(marker) {
                //Create function to animate markers when clicked
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    marker.setAnimation(google.maps.Animation.null);
                }, 500);
                
            }


            }


var Landmark = function(data) {
    this.name = ko.observable(data.title);
    this.clickList = ko.observable(data.marker);
}


var listViewModel = function() {
    var self = this;

    this.landmarkList = ko.observableArray([]);

    locations.forEach(function(landmarkItem){
        self.landmarkList.push( new Landmark(landmarkItem) );

    })
    this.currentLandmark = ko.observable( this.landmarkList() [0]);

    this.openMarker = function() {
        self.currentLandmark().landmarkList(self.currentLandmark().landmarkList());
    }


    this.setLandmark = function(clickedLandmark) {
        self.currentLandmark(clickedLandmark);
    }
}


ko.applyBindings(new listViewModel());






