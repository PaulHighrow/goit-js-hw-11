import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const imgSearchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreEl = document.querySelector('.load-more');
const loadMoreBtnEl = document.querySelector('.load-more-btn');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31560784-4ad39ddd1804a97882b0045c5';

imgSearchFormEl.addEventListener('submit', onSearchHandler);
// loadMoreBtnEl.addEventListener('click', onLoadMoreClickHandler);

let pageCounter = 1;
let query = '';
const options = {
  root: null,
  rootMargin: '270px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(loadMoreOnScroll, options);

async function fetchImages(searchQuery, pageNumber) {
  try {
    const resp = await axios.get(BASE_URL, {
      params: {
        key: `${API_KEY}`,
        q: `${searchQuery}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: `${pageNumber}`,
        per_page: '40',
      },
    });
    return resp;
  } catch (error) {
    console.log(error);
  }
}

async function onSearchHandler(evt) {
  evt.preventDefault();
  // loadMoreBtnEl.classList.add('is-hidden');
  observer.unobserve(loadMoreEl);
  galleryEl.innerHTML = '';
  pageCounter = 1;
  query = imgSearchFormEl.elements.searchQuery.value.trim();
  if (!query) {
    return;
  }
  const {
    data: { totalHits, hits, total },
    config: {
      params: { per_page },
    },
  } = await fetchImages(query, pageCounter);
  if (hits.length == per_page) {
    observer.observe(loadMoreEl);
    // loadMoreBtnEl.classList.remove('is-hidden');
  }
  if (!total) {
    throw new Error();
  } else {
    Notify.success(`Hooray! We found ${totalHits} images.`);
    try {
      renderImages(hits);
      gallerySimpleLightbox.refresh();

      const { height: formHeight } = imgSearchFormEl.getBoundingClientRect();

      window.scrollBy({
        top: formHeight,
        behavior: 'smooth',
      });
    } catch (error) {
      console.log(error);
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    return query;
  }
}

async function onLoadMoreClickHandler() {
  pageCounter += 1;
  const {
    data: { hits },
    config: {
      params: { per_page },
    },
  } = await fetchImages(query, pageCounter);

  if (hits.length != per_page) {
    loadMoreBtnEl.classList.add('is-hidden');
  }
  if (!hits.length) {
    throw new Error();
  } else {
    try {
      renderImages(hits);
      gallerySimpleLightbox.refresh();
      const { height: cardHeight } =
        galleryEl.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 3,
        behavior: 'smooth',
      });
    } catch (error) {
      console.log(error);
      loadMoreBtnEl.classList.add('is-hidden');
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }
}

async function loadMoreOnScroll(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      pageCounter += 1;
      const resp = await fetchImages(query, pageCounter);
      const {
        data: { hits },
        config: {
          params: { per_page },
        },
      } = resp;
      try {
        if (hits.length != per_page) {
          Notify.info(
            'These are the last search results, so feel free to search something else.'
          );
        }
        if (!hits.length) {
          Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
          throw new Error();
        } else {
          renderImages(hits);
          gallerySimpleLightbox.refresh();
          const { height: cardHeight } =
            galleryEl.firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 3,
            behavior: 'smooth',
          });
        }
      } catch (error) {
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  });
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
