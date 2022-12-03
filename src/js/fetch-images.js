import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const imgSearchFormEl = document.querySelector('.search-form');
const loadMoreEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31560784-4ad39ddd1804a97882b0045c5';

imgSearchFormEl.addEventListener('submit', onSearchHandler);

let pageCounter = 1;
const options = {
  root: document.querySelector('body'),
  rootMargin: '250px',
  threshold: 1.0,
};

async function fetchImages(searchQuery) {
  try {
    return (resp = await axios.get(BASE_URL, {
      params: {
        key: `${API_KEY}`,
        q: `${searchQuery}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: `${pageCounter}`,
        per_page: '40',
      },
    }));
  } catch (error) {
    console.log(error);
  }
}

function onSearchHandler(evt) {
  evt.preventDefault();
  galleryEl.innerHTML = '';
  let query = imgSearchFormEl.elements.searchQuery.value.trim();
  fetchImages(query)
    .then(
      ({
        data: { totalHits, hits, total },
        config: {
          params: { page },
        },
      }) => {
        if (!total) {
          throw new Error();
        } else {
          Notify.success(`Hooray! We found ${totalHits} images.`);
          return hits;
        }
      }
    )
    .then(hits => {
      renderImages(hits);
      gallerySimpleLightbox.refresh();
      observer = new IntersectionObserver(loadMoreOnScroll, options);
      observer.observe(loadMoreEl);
      const { height: cardHeight } =
        galleryEl.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    })
    .catch(error => {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });
  return;
}

// function loadMoreOnScroll() {
//   console.log('you made it that far');
//   fetchImages(imgSearchFormEl.elements.searchQuery.value.trim())
//     .then(
//       ({
//         data: { totalHits, hits, total },
//         config: {
//           params: { page },
//         },
//       }) => {
//         if (!total) {
//           throw new Error();
//         } else {
//           pageCounter += 1;
//           Notify.success(`Hooray! We found ${totalHits} images.`);
//           return hits;
//         }
//       }
//     )
//     .then(hits => renderImages(hits))
//     .catch(error => {
//       Notify.failure(
//         'Sorry, there are no images matching your search query. Please try again.'
//       );
//     });
// }

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
