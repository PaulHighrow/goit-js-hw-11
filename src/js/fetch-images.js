import { Notify } from 'notiflix';

console.log('fetching');

const imgSearchFormEl = document.querySelector('.search-form');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31560784-4ad39ddd1804a97882b0045c5';
let params = '';

imgSearchFormEl.addEventListener('submit', onSearchHandler);

async function fetchImages(searchQuery) {
  params = `q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true`;
  try {
    return await fetch(`${BASE_URL}?key=${API_KEY}&${params}`).then(resp =>
      resp.json()
    );
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function onSearchHandler(evt) {
  evt.preventDefault();
  console.log(imgSearchFormEl.elements.searchQuery.value.trim());
  fetchImages(imgSearchFormEl.elements.searchQuery.value.trim()).then(images =>
    console.log('something', images)
  );
  return;
}
