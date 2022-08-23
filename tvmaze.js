"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $episodesList = $("#episodes-list");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  const shows = [];

  // make request to TVMaze search shows API
  await $.get( `http://api.tvmaze.com/search/shows?q=${searchTerm}`, function( data ) {
    // from the result, add data from each show to the shows array  
    for (let item of data) {
      const {id, name, image, summary} = item.show;
      shows.push({id, image, name, summary});
    }    
  });

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let img = '';

    // if image is available, use it, if not, use a placeholder image
    try {
      img = show.image.medium;
    } catch(error) {
      img = 'https://tinyurl.com/tv-missing';
    }

    // update HTML using info from show data
    const $show = $(
     `<div data-show-id="${show.id}" class="card col-sm-8 col-md-5 col-lg-3 col-xl-2 m-2 pb-3">
        <div class="media">
          <img 
            src="${img}" 
            alt="${show.name}" 
            class="card-img-top mr-3 my-2">
          <div class="media-body">
            <h5 class="text-primary">${show.name}</h5>
            <div><small>${show.summary}</small></div>
              <a href="#episodes-area">
                <button class="btn btn-outline-primary">
                  Episodes
                </button>
              </a>
          </div>
        </div>  
      </div>`
    );

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  await populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

 async function getEpisodesOfShow(id) {
  const episodes = [];

  // make request to TVMaze search shows API
  await $.get( `http://api.tvmaze.com/shows/${id}/episodes`, function( data ) {
    // from the result, add data from each episode to the episodes array  
    for (let item of data) {
      const {id, name, season, number} = item;
      episodes.push({id, name, season, number});
    }    
  });

  return episodes;
}


/** Given a list of episodes, create markup for each and add to DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();
  $episodesArea.show();

  for (let episode of episodes) {
    // update HTML using info from episode data
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`
    );

    $episodesList.append($episode);  }
}


/** When an Episodes button is clicked for a show, find the show ID and use
 *  it to request a list of episodes and display them in the DOM
 */

$showsList.on("click", async function (evt) {
  const id = $(evt.target).parent().parent().parent().parent().attr('data-show-id');
  const episodes = await getEpisodesOfShow(id);

  $episodesArea.show();
  await populateEpisodes(episodes);
});