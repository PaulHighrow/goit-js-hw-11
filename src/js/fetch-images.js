import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const imgSearchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31560784-4ad39ddd1804a97882b0045c5';
let params = '';

imgSearchFormEl.addEventListener('submit', onSearchHandler);

async function fetchImages(searchQuery) {
  try {
    return (resp = await axios
      .get(BASE_URL, {
        params: {
          key: `${API_KEY}`,
          q: `${searchQuery}`,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: 'true',
        },
      })
      .then(({ data: { totalHits, hits, total } }) => {
        if (!total) {
          throw new Error();
        } else {
          Notify.success(`Hooray! We found ${totalHits} images.`);
          return hits;
        }
      }));
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function onSearchHandler(evt) {
  evt.preventDefault();
  galleryEl.innerHTML = '';
  let query = imgSearchFormEl.elements.searchQuery.value.trim();
  fetchImages(query).then(hits => renderImages(hits));
  return;
}

function renderImages(hits) {
  const markup = hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
          <a href="${largeImageURL}">
            <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes: </b>${likes}
            </p>
            <p class="info-item">
              <b>Views: </b>${views}
            </p>
            <p class="info-item">
              <b>Comments: </b>${comments}
            </p>
            <p class="info-item">
              <b>Downloads: </b>${downloads}
            </p>
          </div>
        </div>`
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

let gallerySimpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
