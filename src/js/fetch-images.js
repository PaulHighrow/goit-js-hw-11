import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

console.log('fetching');

const imgSearchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');

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
  fetchImages(imgSearchFormEl.elements.searchQuery.value.trim()).then(
    ({ hits }) => {
      console.log('something', hits);
      renderImages(hits);
    }
  );

  return;
}

function renderImages(hits) {
  galleryEl.innerHTML = hits
    .map(
      ({ largeImageURL, webformatURL, tags }) =>
        `<li class="gallery__item"><a href="${largeImageURL}"><img class="gallery__image" src="${webformatURL}" alt="${tags}"/></a></li>`
    )
    .join('');
}

let simpleLightBoxGallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
