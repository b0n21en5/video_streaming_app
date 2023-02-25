const apiKey = "214ac28271b1d3117fdf5a6a125f0277";
const apiEndPoint = "https://api.themoviedb.org/3/";

const imgPath = "https://image.tmdb.org/t/p/original";


const apiPaths = {
    fetchAllCategories: `${apiEndPoint}/genre/movie/list?api_key=${apiKey}`,

    fetchMoviesList: (id) => `${apiEndPoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending: `${apiEndPoint}/trending/all/day?api_key=${apiKey}&language=en-US`,

    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}%20trailer&key=AIzaSyDETGl436xgaSBmVVK_U-dJn1ov58sKNeI`
}




// Boots up the app
function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}


function fetchTrendingMovies(){
    fetchAndBuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
    .then(list => {
        const randomIndex = parseInt(Math.random() * list.length);
        buildBannerSection(list[randomIndex])
    }).catch(err => {
        console.error(err);
    })
}


function buildBannerSection(movie){
    const bannerSection = document.getElementById('banner-section');
    bannerSection.style.backgroundImage = `url(${imgPath}${movie.backdrop_path})` 

    const div = document.createElement('div');
    div.innerHTML = `
            <h2 class="banner_title">${movie.title}</h2>
            <p class="banner_info">Trending in Movies | Popularity - ${movie.popularity}</p>
            <p class="banner_overview">${movie.overview && movie.overview.length>200?movie.overview.slice(0, 200).trim()+'...':movie.overview}</p>
            <div class="action-buttons-cnt">
            <button class="action-button"><svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5.49686C3 3.17662 5.52116 1.73465 7.52106 2.91106L18.5764 9.41423C20.5484 10.5742 20.5484 13.4259 18.5764 14.5858L7.52106 21.089C5.52116 22.2654 3 20.8234 3 18.5032V5.49686Z" fill="#323232"/>
                </svg>&nbsp;Play</button>
            <button class="action-button"><svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier"> <path d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
                </svg>&nbsp;More Info</button>
            </div>
    `
    div.className = "banner-cnt container"
    bannerSection.append(div);
}



function fetchAndBuildAllSections() {
    fetch(apiPaths.fetchAllCategories)
    .then(res => res.json())
    .then(res => {
        const categories = res.genres;

        if (Array.isArray(categories) && categories.length){

            categories.forEach(category => {
                fetchAndBuildMovieSection(apiPaths.fetchMoviesList(category.id), category.name);
            })
        }

        console.table(categories);
    })

    .catch(err => console.log(err))
}



function fetchAndBuildMovieSection( fetchUrl, categoryName ) {
    console.log(fetchUrl, categoryName);

    return fetch(fetchUrl)
    .then(res => res.json())
    .then(res => { 
        // console.log(res.results)
        const movies = res.results;
        if (Array.isArray(movies) && movies.length){
            buildMoviesSection(movies, categoryName);
        }
        return movies;
    })
    .catch(err => console.error(err))
}



function buildMoviesSection(list, categoryName) {
    console.log(list, categoryName);

    const moviesCnt = document.getElementById('movies-cnt');

    const moviesListHtml = list.map(item => {
        return `
            <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title}', 'yt${item.id}')">
                <img class="movie-item-image" src="${imgPath}${item.backdrop_path}" alt="${item.title}" >
                <div class="iframe-wrap" id="yt${item.id}"></div>
            </div>
        `;
    }).join('');


    const moviesSectionHtml = `
        <h2 class="movie-section-heading">${categoryName} <span class="explore-nudge">Explore All</span></h2>
        <div class="movies-row">
            ${moviesListHtml}
        </div>
    `

    // console.log(moviesSectionHtml);

    const div = document.createElement('div');
    div.className = "movies-section";
    div.innerHTML = moviesSectionHtml


    // append html into movies container
    moviesCnt.append(div)
}


function searchMovieTrailer(movieName, iFrameId) {
    if (!movieName) return;

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(res => res.json())
    .then( res => {
        const bestResults = res.items[0];
        const youtubeUrl = `https://www.youtube.com/watch?v=${bestResults.id.videoId}`
        const elements = document.getElementById(iFrameId);

        const div = document.createElement('div');
        div.innerHTML = `<iframe width="245px" height="150px" src="https://www.youtube.com/embed/${bestResults.id.videoId}?autoplay=1&mute=1"></iframe>`

        elements.append(div);

    })
    .catch(err => {console.log(err);})
}



window.addEventListener('load', function() {
    init();

    this.window.addEventListener('scroll', function(){
        // header ui update
        const header = document.getElementById('header');

        if (this.window.scrollY > 5) header.classList.add('black-bg')
        else header.classList.remove('black-bg')
    })
})