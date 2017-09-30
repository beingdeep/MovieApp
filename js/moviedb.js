$ = (function () {
    var elementId;
    function NodeList(elems) {
        if (elems.startsWith('#')) {
            if (document.getElementById(elems.substr(1))) {
                this.element = document.getElementById(elems.substr(1));
            }
            else {
                console.error('element not found');
            }

        }
        else if (elems.startsWith('.')) {
            if (document.getElementsByClassName(elems.substr(1))) {
                this.element = document.getElementsByClassName(elems.substr(1))[0];
            }
            else {
                console.error('element not found');
            }
        }
        else {
            if (document.getElementsByTagNameName(elems)) {
                this.element = document.getElementsByTagName(elems.substr(1))[0];
            }
            else {
                console.error('element not found');
            }

        }
        this.elementId = this.element.getAttribute('id');
        elementId = this.element.getAttribute('id');
    }

    function $(elems) {
        return new NodeList(elems);
    }

    $.NodeList = NodeList;

    NodeList.prototype = {
        slider: function (autoStart) {
            var elemId = this.elementId;
            if (autoStart === undefined) {
                autoStart = false;
            }
            var localUrl = url.format('now_playing', apiKey);
            ajax(localUrl, function (data) {
                if (data.response == 1) {
                    var result = data.data;
                    if (!autoStart) {
                        var leftArrow = document.createElement('img');
                        leftArrow.setAttribute('id', "slider-left-arrow");
                        leftArrow.setAttribute('src', "images/left-nav.png");
                        leftArrow.setAttribute('alt', "left-nav");

                        document.getElementById(elemId).appendChild(leftArrow);

                        var rightArrow = document.createElement('img');
                        rightArrow.setAttribute('id', "slider-right-arrow");
                        rightArrow.setAttribute('src', "images/right-nav.png");
                        rightArrow.setAttribute('alt', "right-nav");

                        document.getElementById(elemId).appendChild(rightArrow);
                    }
                    appendSliderHtml(elemId, result, function () {
                        bindThumb(result.length - 1 > 9 ? 10 : result.length - 1, function (div) {
                            document.getElementById(elemId).appendChild(div);
                        });
                    });
                }
                else {
                    console.error(data.data);
                }
                //hideLoader();
            });
            if (autoStart) { /*call auto start*/ };
        },
        // pass int value to change it to particular slide
        // pass string direction to change one by one on the passed direction
        changeSlide: function (index) {
            var elemId = this.elementId;
            var slider = document.getElementById(elemId);
            if (slider.innerHTML != null && slider.innerHTML.trim() != ''
                && slider.getElementsByClassName('center').length > 0) {
                var currentSlide = slider.getElementsByClassName('center')[0];
                var currentIndex = currentSlide.getAttribute('data-id');
                if (index === undefined || index == null) {
                    return currentIndex;
                }
                else if (/^\d+$/.test(index)) {
                    if (currentIndex == index) {
                        return;
                    }
                    setNextImage(index, function () {

                    });
                }
                else if (index.toLowerCase() == 'left') {
                    setNextImage(currentIndex - 1, function () {

                    });
                }
                else if (index.toLowerCase() == 'right') {
                    setNextImage(currentIndex + 1, function () {

                    });
                }
                else {
                    console.error('invalid parameter');
                }
            }
            else {
                console.error('slider not defined');
            }

        },
        getMovies: function (filterType, pageNumber) {
            var elemId = this.elementId;
            document.getElementById(elemId).innerHTML = '';
            var image = document.createElement("img");
            image.setAttribute('id', 'loader-image');
            image.setAttribute('src', 'images/loader.gif');
            image.setAttribute('alt', 'loader-image');
            document.getElementById(elemId).appendChild(image);
            switch (filterType.toLowerCase()) {
                case 'popular':
                case 'now_playing':
                case 'top_rated':
                case 'upcoming':
                    var localUrl = url.format(filterType, apiKey);
                    ajax(localUrl, function (data) {
                        setTimeout(function () {
                            var element = document.getElementById('loader-image');
                            element.outerHTML = "";
                            delete element;
                            setMovieList(elemId, data.data, function () {
                            });
                        }, 1000); 
                    });
                    break;
                default:
                    console.error('parameters choices are : latest,now_playing,top_rated,upcoming');
                    break;
            }
        },
        getMovieDetails: function (movieId) {
            var elemId = this.elementId;
            document.getElementById(elemId).innerHTML = '';
        }
    };

    var url = 'https://api.themoviedb.org/3/movie/{0}?api_key={1}';
    var apiKey = 'fb5875eace5a99021e9a7dc4728b1a6b';
    var imageUrl = 'http://image.tmdb.org/t/p/w500/{0}';
    var movieDetails = 'https://api.themoviedb.org/3/movie/{0}?api_key={1}&language=en-US';

    var genre = [{ "id": 28, "name": "Action" }, { "id": 12, "name": "Adventure" }, { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" }, { "id": 80, "name": "Crime" }, { "id": 99, "name": "Documentary" }, { "id": 18, "name": "Drama" }, { "id": 10751, "name": "Family" }, { "id": 14, "name": "Fantasy" }, { "id": 36, "name": "History" }, { "id": 27, "name": "Horror" }, { "id": 10402, "name": "Music" }, { "id": 9648, "name": "Mystery" }, { "id": 10749, "name": "Romance" }, { "id": 878, "name": "Science Fiction" }, { "id": 10770, "name": "TV Movie" }, { "id": 53, "name": "Thriller" }, { "id": 10752, "name": "War" }, { "id": 37, "name": "Western" }];

    function ajax(url, call) {
        //showLoader();

        var promise = new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url);
            request.onload = function () {
                if (request.status == 200) {
                    resolve(request.response); // we got data here, so resolve the Promise
                } else {
                    reject(Error(request.statusText)); // status is not 200 OK, so reject
                }
            };
            request.onerror = function () {
                reject(Error('Error fetching data.')); // error occurred, reject the  Promise
            };

            request.send(); //send the request
        });

        var result = {};
        promise.then(function (data) {
            var response = JSON.parse(data);
            response = response.results;
            result["response"] = 1;
            result["data"] = response;
            call(result);
        }, function (error) {
            result["response"] = 0;
            result["data"] = error.message;
            call(result);
        });
    }

    function showLoader() {
        if (document.getElementById("overlay") == null
            || document.getElementById("overlay") === undefined
            || document.getElementById("overlay").length < 1) {
            var div = document.createElement("div");
            div.setAttribute("id", "overlay");
            var image = document.createElement("img");
            image.setAttribute('id', 'loader-image');
            image.setAttribute('src', 'images/loader.gif');
            image.setAttribute('alt', 'loader-image');
            div.appendChild(image);
            document.body.appendChild(div);
        }
        document.getElementById("overlay").style.display = "block";
    }

    function hideLoader() {
        document.getElementById("overlay").style.display = "none";
    }

    function bindSlider(index, imageUrl) {
        var div = document.createElement("div");
        var img;
        // if (index == 0) {
        //     img = document.createElement("div");
        // }
        // else {
        img = document.createElement("img");
        img.setAttribute('src', imageUrl);
        img.setAttribute('alt', 'poster_image' + i);
        // }
        switch (index) {
            case 0:
                div.setAttribute('class', 'one6 allign-right');
                img.setAttribute('class', 'left-image poster');
                img.style.opacity = 0.5;
                break;
            case 1:
                div.setAttribute('class', 'one6 box-img');
                img.setAttribute('class', 'center poster effect8');
                img.style.opacity = 1;
                break;
            case 2:
                div.setAttribute('class', 'one6 allign-left');
                img.setAttribute('class', 'right-image poster');
                img.style.opacity = 0.5;
                break;
            default:
                div.setAttribute('class', 'one6');
                img.setAttribute('class', 'poster');
                img.style.display = 'none';
                img.style.opacity = 0;
                break;
        }
        img.setAttribute('data-id', index);
        div.appendChild(img);
        return div;
    }

    function bindThumb(length, call) {
        var div = document.createElement("div");
        div.setAttribute('class', 'full');
        div.setAttribute('id', 'image-thumbs');
        for (i = 0; i <= length; i++) {
            var innderDiv = document.createElement("div");
            innderDiv.setAttribute('class', 'image-thumb-icon');
            innderDiv.setAttribute('data-index', i);
            div.appendChild(innderDiv);
        }
        return call(div);
    }

    function appendSliderHtml(elemId, data, call) {
        var limit = data.length - 1 > 9 ? 10 : data.length - 1;
        for (i = 0; i <= limit; i++) {
            document.getElementById(elemId).appendChild(
                bindSlider(i, imageUrl.format(data[i].poster_path)));
            // if (i == 0) {
            //     document.getElementById(elemId).appendChild(
            //         bindSlider(i, ''));
            // }
            // else if (i == limit) {
            //     document.getElementById(elemId).appendChild(
            //         bindSlider(i, ''));
            // }
            // else {
            //     document.getElementById(elemId).appendChild(
            //         bindSlider(i, imageUrl.format(data[i].poster_path)));
            // }
        }
        return call();
    }

    function setMovieList(elemId, data, call) {
        for (i = 0; i <= 3; i++) {
            bindGenre(data[i], function (genreDiv) {
                var div = document.createElement('div');
                div.setAttribute('class', 'movie-thumbs');
                if (i < 3) {
                    div.setAttribute('class', 'movie-thumbs margin-right');
                }
                var posterDiv = document.createElement('div');
                posterDiv.setAttribute('class', "movie-poster");

                posterDiv.style.backgroundImage = 'url(' + imageUrl.format(data[i].poster_path) + ')'; //url('../images/poster1.jpg')
                div.appendChild(posterDiv);
                var posterOverlay = document.createElement('div');
                posterOverlay.setAttribute('class', 'movie-poster-overlay');
                var posterOverlayData = document.createElement('div');
                posterOverlayData.setAttribute('class', 'u-a');
                var certificateSpan = document.createElement('span');
                certificateSpan.innerHTML = data[i].adult ? 'A' : 'UA';
                posterOverlayData.appendChild(certificateSpan);
                var likeDiv = document.createElement('div');
                likeDiv.setAttribute('class', 'heart');
                posterOverlayData.appendChild(likeDiv);
                var votes = document.createElement('span');
                votes.setAttribute('class', 'votes');
                votes.innerHTML = data[i].vote_average + '%';
                posterOverlayData.appendChild(votes);
                var totalVotes = document.createElement('span');
                totalVotes.setAttribute('class', 'total-votes');
                totalVotes.innerHTML = data[i].vote_count + ' votes';
                posterOverlayData.appendChild(totalVotes);
                posterOverlay.appendChild(posterOverlayData);
                div.appendChild(posterOverlayData);


                div.appendChild(genreDiv);

                var movieTitle = document.createElement('h3');
                movieTitle.innerHTML = data[i].title;
                div.appendChild(movieTitle);
                var movieDetails = document.createElement('h5');
                movieDetails.innerHTML = data[i].overview.length > 200 ? data[i].overview.substr(0, 197) + '...' : data[i].overview;
                div.appendChild(movieDetails);
                var detailsButton = document.createElement('button');
                detailsButton.setAttribute('class', 'trigger-button');
                detailsButton.setAttribute('data-id', data[i].id);
                detailsButton.innerHTML = 'View Details';
                div.appendChild(detailsButton);

                document.getElementById(elemId).appendChild(div);
            });

        }
    }

    function bindGenre(arrGenre, call) {
        var genreDiv = document.createElement('div');
        genreDiv.setAttribute('class', 'genre');
        for (j = 0; j < (3 < arrGenre.genre_ids.length ? 3 : arrGenre.genre_ids.length); j++) {
            //genre
            var genreSpan = document.createElement('span');
            genreSpan.innerHTML = search(arrGenre.genre_ids[j]);
            genreDiv.appendChild(genreSpan);
        }
        call(genreDiv)
    }
    function setNextImage(targetIndex, call) {
        elemId = elementId;
        var slider = document.getElementById(elemId);
        var slides = document.querySelectorAll('#' + elemId + '>div');
        var targetIndex = targetIndex;
        var prevTrgtIndex = targetIndex - 1 < 0 ? 0 : targetIndex - 1;
        var nextTrgtIndex = targetIndex + 1 > slides.length ? slides.length : targetIndex + 1;

        var currentSlide = slider.getElementsByClassName('center')[0];

        var currentIndex = +currentSlide.getAttribute('data-id');
        var prevCurrIndex = +currentIndex - 1 < 0 ? 0 : currentIndex - 1;
        var nextCurrIndex = +currentIndex + 1 > slides.length ? slides.length : currentIndex + 1;

        var elCurr = document.querySelectorAll('#' + elemId + '>div>img[data-id="' + currentIndex + '"]')[0];
        var elNCurr = document.querySelectorAll('#' + elemId + '>div>img[data-id="' + nextCurrIndex + '"]')[0]
        if (!elNCurr) {
            elNCurr = document.querySelectorAll('#' + elemId + '>div>div[data-id="' + nextCurrIndex + '"]')[0]
        }
        var elPCurr = document.querySelectorAll('#' + elemId + '>div>img[data-id="' + prevCurrIndex + '"]')[0];
        if (!elPCurr) {
            elPCurr = document.querySelectorAll('#' + elemId + '>div>div[data-id="' + prevCurrIndex + '"]')[0];
        }
        var animation = setInterval(function () {
            elNCurr.style.opacity = elNCurr.style.opacity - .01;
            elPCurr.style.opacity = elPCurr.style.opacity - .01;
            elCurr.style.opacity = elCurr.style.opacity - .02;
            if (elCurr.style.opacity == 0) {
                clearInterval(animation);
                elCurr.setAttribute('class', 'poster');
                elCurr.parentElement.setAttribute('class', 'one6');
                elNCurr.setAttribute('class', 'poster');
                elNCurr.parentElement.setAttribute('class', 'one6');
                elPCurr.setAttribute('class', 'poster');
                elPCurr.parentElement.setAttribute('class', 'one6');

                elCurr.style.display = 'none';
                elNCurr.style.display = 'none';
                elPCurr.style.display = 'none';
                var elTrgt = document.querySelectorAll('#' + elemId + '>div>img[data-id="' + targetIndex + '"]')[0];
                var elpTrgt = document.querySelectorAll('#' + elemId + '>div>img[data-id="' + prevTrgtIndex + '"]')[0];
                var elnTrgt = document.querySelectorAll('#' + elemId + '>div>img[data-id="' + nextTrgtIndex + '"]')[0];

                elpTrgt.parentElement.setAttribute('class', 'one6 allign-right');
                elpTrgt.setAttribute('class', 'left-image poster');
                elpTrgt.style.display = ''
                elpTrgt.style.opacity = 0;


                elTrgt.parentElement.setAttribute('class', 'one6 box-img');
                elTrgt.setAttribute('class', 'center poster effect8');
                elTrgt.style.display = ''
                elTrgt.style.opacity = 0;

                elnTrgt.parentElement.setAttribute('class', 'one6 allign-left');
                elnTrgt.setAttribute('class', 'right-image poster');
                elnTrgt.style.display = ''
                elnTrgt.style.opacity = 0;
                var anime = setInterval(function () {
                    elTrgt.style.opacity = +elTrgt.style.opacity + 1;
                    elnTrgt.style.opacity = +elnTrgt.style.opacity + 1;
                    elpTrgt.style.opacity = +elpTrgt.style.opacity + 1;
                    if (elTrgt.style.opacity == 1) {
                        clearInterval(anime);
                        return call();
                    }

                }, 10);
            }
        }, 10);
    }

    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }
    // if (!Array.prototype.filter) {
    //     Array.prototype.filter = function (id) {
    //         var args = arguments;
    //         for (var i = 0; i < this.length; i++) {
    //             if (this[i].id === id) {
    //                 return this[i];
    //             }
    //         }
    //     };
    // }
    function search(id) {
        for (var i = 0; i < genre.length; i++) {
            if (genre[i].id === id) {
                return genre[i].name;
            }
        }
    }
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    return $;
})();