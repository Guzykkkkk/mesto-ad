const getTemplate = () => {
    return document
        .getElementById("card-template")
        .content.querySelector(".card")
        .cloneNode(true);
};

export const deleteCard = (cardElement) => {
    cardElement.remove();
};

export const isLikedCard = (likes, userId) => {
    return likes.some((user) => user._id === userId);
};
export const hasActiveLike = (likeButton) => {
    return likeButton.classList.contains("card__like-button_is-active");
};

export const updateLikesView = (cardElement, likes, userId) => {
    const likeButton = cardElement.querySelector(".card__like-button");
    const likeCount = cardElement.querySelector(".card__like-count");

    likeCount.textContent = likes.length;

    if (isLikedCard(likes, userId)) {
        likeButton.classList.add("card__like-button_is-active");
    } else {
        likeButton.classList.remove("card__like-button_is-active");
    }
};

export const createCardElement = (
    data,
    userId,
    { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
    const cardElement = getTemplate();
    const likeButton = cardElement.querySelector(".card__like-button");
    const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
    const cardImage = cardElement.querySelector(".card__image");
    const titleElement = cardElement.querySelector(".card__title");

    cardImage.src = data.link;
    cardImage.alt = data.name;
    titleElement.textContent = data.name;

    updateLikesView(cardElement, data.likes, userId);

    if (data.owner._id !== userId) {
        deleteButton.remove();
    } else {
        deleteButton.addEventListener("click", () => {
            onDeleteCard(data._id, cardElement);
        });
    }

    likeButton.addEventListener("click", () => {
        onLikeIcon(data._id, likeButton, cardElement);
    });

    cardImage.addEventListener("click", () => {
        onPreviewPicture({ name: data.name, link: data.link });
    });

    return cardElement;
};