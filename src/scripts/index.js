import "./../pages/index.css";

import { createCardElement, deleteCard, isLikedCard, updateLikesView } from "./components/card.js";
import {
    openModalWindow,
    closeModalWindow,
    setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
    getUserInfo,
    getCardList,
    setUserInfo,
    setUserAvatar,
    addNewCard,
    deletedCard,
    changeLikeCardStatus,
} from "./components/api.js";

const validationSettings = {
    formSelector: ".popup__form",
    inputSelector: ".popup__input",
    submitButtonSelector: ".popup__button",
    inactiveButtonClass: "popup__button_disabled",
    inputErrorClass: "popup__input_type_error",
    errorClass: "popup__error_visible",
};

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoLikesTitle = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoLikesList = cardInfoModalWindow.querySelector(".popup__list");
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

let userId = "";

const renderLoading = (buttonElement, isLoading, defaultText, loadingText) => {
    buttonElement.textContent = isLoading ? loadingText : defaultText;
};

const renderProfileInfo = (userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
};

const handlePreviewPicture = ({ name, link }) => {
    imageElement.src = link;
    imageElement.alt = name;
    imageCaption.textContent = name;
    openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardId, cardElement) => {
    removeCard(cardId)
        .then(() => {
            deleteCard(cardElement);
        })
        .catch((err) => {
            console.log(err);
        });
};

const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

const handleLikeCard = (cardId, likeButton, cardElement) => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");

    changeLikeCardStatus(cardId, isLiked)
        .then((updatedCard) => {
            updateLikesView(cardElement, updatedCard.likes, userId);
        })
        .catch((err) => {
            console.log(err);
        });
};

const createInfoString = (term, description) => {
    const template = document
        .getElementById("popup-info-definition-template")
        .content.querySelector(".popup__info-item")
        .cloneNode(true);

    template.querySelector(".popup__info-term").textContent = term;
    template.querySelector(".popup__info-description").textContent = description;

    return template;
};

const createUserPreview = (userName) => {
    const template = document
        .getElementById("popup-info-user-preview-template")
        .content.querySelector(".popup__list-item")
        .cloneNode(true);

    template.textContent = userName;

    return template;
};

const handleInfoClick = (cardId) => {
    getCardList()
        .then((cards) => {
            const cardData = cards.find((card) => card._id === cardId);

            if (!cardData) {
                return;
            }

            cardInfoTitle.textContent = cardData.name;

            cardInfoModalInfoList.innerHTML = "";
            cardInfoLikesList.innerHTML = "";

            cardInfoModalInfoList.append(
                createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt)))
            );

            cardInfoModalInfoList.append(
                createInfoString("Автор:", cardData.owner.name)
            );

            cardInfoModalInfoList.append(
                createInfoString("Всего лайков:", cardData.likes.length)
            );

            cardInfoLikesTitle.textContent =
                cardData.likes.length > 0 ? "Лайкнули:" : "Пока никто не лайкнул";

            cardData.likes.forEach((user) => {
                cardInfoLikesList.append(createUserPreview(user.name));
            });

            openModalWindow(cardInfoModalWindow);
        })
        .catch((err) => {
            console.log(err);
        });
};

const createCard = (cardData) => {
    return createCardElement(cardData, userId, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
        onInfoClick: handleInfoClick,
    });
};

const handleProfileFormSubmit = (evt) => {
    evt.preventDefault();

    const submitButton = evt.submitter;
    renderLoading(submitButton, true, "Сохранить", "Сохранение...");

    setUserInfo({
        name: profileTitleInput.value,
        about: profileDescriptionInput.value,
    })
        .then((userData) => {
            renderProfileInfo(userData);
            closeModalWindow(profileFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            renderLoading(submitButton, false, "Сохранить", "Сохранение...");
        });
};

const handleAvatarFormSubmit = (evt) => {
    evt.preventDefault();

    const submitButton = evt.submitter;
    renderLoading(submitButton, true, "Сохранить", "Сохранение...");

    setUserAvatar({
        avatar: avatarInput.value,
    })
        .then((userData) => {
            profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
            avatarForm.reset();
            closeModalWindow(avatarFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            renderLoading(submitButton, false, "Сохранить", "Сохранение...");
        });
};

const handleCardFormSubmit = (evt) => {
    evt.preventDefault();

    const submitButton = evt.submitter;
    renderLoading(submitButton, true, "Создать", "Создание...");

    addNewCard({
        name: cardNameInput.value,
        link: cardLinkInput.value,
    })
        .then((cardData) => {
            placesWrap.prepend(createCard(cardData));
            cardForm.reset();
            closeModalWindow(cardFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            renderLoading(submitButton, false, "Создать", "Создание...");
        });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;
    clearValidation(profileForm, validationSettings);
    openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
    avatarForm.reset();
    clearValidation(avatarForm, validationSettings);
    openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
    cardForm.reset();
    clearValidation(cardForm, validationSettings);
    openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
    setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
        userId = userData._id;
        renderProfileInfo(userData);

        cards.forEach((cardData) => {
            placesWrap.append(createCard(cardData));
        });
    })
    .catch((err) => {
        console.log(err);
    });

enableValidation(validationSettings);