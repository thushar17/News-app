

document.addEventListener("DOMContentLoaded", function () {
  const API_KEY = "c7c7e9370852438ea536018869b71324";
  const BASE_URL = "https://newsapi.org/v2";
  const PROXY_URL = "https://api.allorigins.win/raw?url=";

  const newsContainer = document.getElementById("news-container");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const loadMoreBtn = document.getElementById("load-more");
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notification-text");

  let currentCategory = "general";
  let currentPage = 1;
  let currentQuery = "";

  // load first news
  fetchNews();

  // category buttons
  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      categoryButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      button.classList.add("active");

      currentCategory = button.dataset.category;
      currentPage = 1;
      currentQuery = "";
      searchInput.value = "";
      fetchNews();
    });
  });

  // search
  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // load more
  loadMoreBtn.addEventListener("click", function () {
    currentPage++;
    fetchNews(true);
  });

  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      currentQuery = query;
      currentPage = 1;
      fetchNews();
    }
  }

  function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add("show");
    setTimeout(function () {
      notification.classList.remove("show");
    }, 3000);
  }

  function fetchNews(append = false) {
    let realUrl = "";
    if (currentQuery) {
      realUrl =
        BASE_URL +
        "/everything?q=" +
        currentQuery +
        "&page=" +
        currentPage +
        "&pageSize=12&apiKey=" +
        API_KEY;
    } else {
      realUrl =
        BASE_URL +
        "/top-headlines?category=" +
        currentCategory +
        "&country=us&page=" +
        currentPage +
        "&pageSize=12&apiKey=" +
        API_KEY;
    }

    let url = PROXY_URL + encodeURIComponent(realUrl);

    if (!append) {
      newsContainer.innerHTML =
        '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
      loadMoreBtn.style.display = "none";
    }

    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.status === "ok") {
          displayNews(data.articles, append);
        } else {
          newsContainer.innerHTML =
            "<div class='error'>Failed to load news</div>";
        }
      })
      .catch(function (err) {
        console.error(err);
        newsContainer.innerHTML =
          "<div class='error'><i class='fas fa-exclamation-triangle'></i> Error loading news</div>";
      });
  }

  function displayNews(articles, append) {
    if (!append) {
      newsContainer.innerHTML = "";
    }

    if (articles.length === 0 && !append) {
      newsContainer.innerHTML =
        '<div class="error"><i class="fas fa-exclamation-circle"></i> No news articles found.</div>';
      loadMoreBtn.style.display = "none";
      return;
    }

    articles.forEach(function (article) {
      const newsCard = document.createElement("div");
      newsCard.className = "news-card";

      const img =
        article.urlToImage ||
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";
      const date = new Date(article.publishedAt).toLocaleDateString();

      newsCard.innerHTML =
        '<div class="news-image-container">' +
        '<img src="' +
        img +
        '" class="news-image">' +
        "</div>" +
        '<div class="news-content">' +
        "<h3 class='news-title'>" +
        (article.title || "No title available") +
        "</h3>" +
        "<p class='news-description'>" +
        (article.description || "No description available") +
        "</p>" +
        '<div class="news-meta">' +
        "<span class='source-badge'>" +
        (article.source.name || "Unknown") +
        "</span>" +
        "<span>" +
        date +
        "</span>" +
        "</div>" +
        "</div>";

      if (article.url) {
        newsCard.style.cursor = "pointer";
        newsCard.addEventListener("click", function () {
          window.open(article.url, "_blank");
        });
      }

      newsContainer.appendChild(newsCard);
    });

    if (articles.length > 0) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
});
