//Define global map and markers variables
            var map;
            var markers = [];
            var viewModel;
            //Our view, locations that we'll display
            var locations = [{
                title: "California State Capital Museum",
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
                        id: i,
                        map: map,
                        position: position,
                        animation: google.maps.Animation.DROP,
                    });
                //Push markers to the map
                //markers.push(marker);
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
                    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title;


                    //Create ajax request object
                    $.ajax({
                        url: wikiUrl,
                        dataType: "jsonp",
                        success: function( response ) {
                            var wikiStr = response[1];
                            var wikipediaURL = 'https://en.wikipedia.org/wiki/' + wikiStr;
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
            viewModel = new ViewModel();
            //Apply bindings so model will update when events are clicked
            ko.applyBindings(viewModel);

            }

//Just as we created our cat constructor, we now create our landmark constructor
var Landmark = function(location, id) {
    this.marker = location.marker;
    this.title = location.title;
    this.lat = location.location.lat;
    this.lng = location.location.lng;
    this.id = id;

}

//Create our view model
var ViewModel = function() {
    var self = this;

    self.landmarkList = ko.observableArray([]);

//Create a landmark for each landmark
    locations.forEach(function(landmarkItem){
        self.landmarkList.push( new Landmark(landmarkItem) );

    })


    self.clickedListMarkers = function(clickedItem) {
        var index = clickedItem.id;
        var marker = clickedItem.marker;
        google.maps.event.trigger(marker, 'click');
    }


    //Create observable
    self.searchItem = ko.observable('');
    self.searchFilter = function(value) {
        self.landmarkList.removeAll();
        for (var i in locations) {
            if (locations[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.landmarkList.push(locations[i]);
            }
        }
    }
    
    self.change = ko.observable('');
    self.writeSomething = ko.computed(function() {
        console.log('Changed!', self.change());


    });

    self.filteredLandmarks = ko.computed(function(){
        var searchItem = self.searchItem().toLowerCase();
        //console.log(searchItem);
        if (searchItem) {
            return ko.utils.arrayFilter(self.landmarkList(), function(landmark){
                var title = landmark.title.toLowerCase();
                var match = title.indexOf(searchItem) >= 0; //true or false
                //console.log(title, searchItem, match); 
                console.log(landmark.marker);
                landmark.marker.setVisible(match); //true or false


                return match;
            });

        }
        else {
            return self.landmarkList();

        }



    }); 

    self.markerFilter = function(value) {
        for (var i in locations) {
            if (locations[i].marker.setMap(map) !== null) {
                locations[i].marker.setMap(null);
            }
            if (locations[i].marker.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                locations[i].marker.setMap(map);
            }
        }
    }


    //Couple our search items with our search/marker filter functions
    //self.searchItem.subscribe(self.searchFilter);
    //self.searchItem.subscribe(self.markerFilter);

    self.navbarVisible = ko.observable(true);

    self.toggleNavbar = function() {
        self.navbarVisible(!self.navbarVisible());
    }

}


