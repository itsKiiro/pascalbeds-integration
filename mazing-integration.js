console.log('Mazing integration v1.1');

let currentProduct;
let iframeSrc;
let iframeElement;
let customer = 'PASCALBEDSCOUK';
let resizeTimeout;

const waitForMazingFunction = new Promise((resolve) => {
    const interval = 50;
    const checkInterval = setInterval(() => {
        if (typeof mazing === 'function') {
            clearInterval(checkInterval);
            resolve();
        }
    }, interval);
});

const waitForElement = (selector, timeout = 55000) => {
    return new Promise((resolve) => {
        const interval = 50;
        let elapsedTime = 0;

        const checkInterval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(checkInterval);
                resolve(element);
            } else if ((elapsedTime += interval) >= timeout) {
                clearInterval(checkInterval);
                resolve();
            }
        }, interval);
    });
};

// This method gets the sku from the url. This part of the url is used to look for a matching product
// in the mazing world. The project name in the mazing world has to be identical with what this method returns
const getCurrentSKU = () => {
    const url = window.location.href;
    const parts = url.split("/");
    const product = parts.filter(part => part.trim() !== '').pop();
    const productParts = product.split('?');
    currentProduct = `${productParts[0]}`;
    console.log('Final SKU:', currentProduct.toLowerCase());
    return currentProduct.toLowerCase();
};

const cloneAndInsertThumb = (thumbGallery, newImgSrc) => {
    const firstThumb = thumbGallery.children[0];
    if (!firstThumb) return;

    // This clones and inserts the 1. thumb

    const clonedThumb = firstThumb.cloneNode(true);
    clonedThumb.id = 'mazing-thumb';
    clonedThumb.classList.remove('swiper-slide-active', 'minimog-slide-active', 'swiper-slide-thumb-active');

    const innerSlideDiv = clonedThumb.querySelector('.iconic-woothumbs-thumbnails__slide');
    if (innerSlideDiv) {
        innerSlideDiv.classList.remove('iconic-woothumbs-thumbnails__slide--active');
    }

    const originalImg = clonedThumb.querySelector('img');
    if (!originalImg) return;

    originalImg.style.opacity = '0.4';
    originalImg.style.filter = 'brightness(120%) grayscale(100%)';
    originalImg.style.zIndex = '1';
    originalImg.style.position = 'relative';

    clonedThumb.style.position = 'relative';

    const overlayWrapper = document.createElement('div');
    overlayWrapper.style.position = 'absolute';
    overlayWrapper.style.top = '0';
    overlayWrapper.style.left = '0';
    overlayWrapper.style.width = '100%';
    overlayWrapper.style.height = '100%';
    overlayWrapper.style.boxSizing = 'border-box';
    overlayWrapper.style.zIndex = '2';
    overlayWrapper.style.pointerEvents = 'none';

    const overlayImg = document.createElement('img');
    overlayImg.src = newImgSrc;
    overlayImg.id = 'mazing-img';
    overlayImg.style.width = '100%';
    overlayImg.style.height = '100%';
    overlayImg.style.padding = '20%';
    overlayImg.style.objectFit = 'contain';
    overlayImg.style.filter = 'brightness(0) saturate(100%) invert(27%) sepia(12%) saturate(21%) hue-rotate(5deg) brightness(89%) contrast(84%)';

    overlayWrapper.appendChild(overlayImg);
    clonedThumb.appendChild(overlayWrapper);
    if (thumbGallery.children.length >= 2) {
        thumbGallery.insertBefore(clonedThumb, thumbGallery.children[2]);
    } else {
        thumbGallery.appendChild(clonedThumb);
    }
};

const insertIframe = (imgGallery, iframeSrc) => {
    const slickItem1 = imgGallery.querySelector('[data-slick-index="1"]');
    if (!slickItem1) return;

    const iframeWrapper = document.createElement('div');
    iframeWrapper.style.width = '100%';
    iframeWrapper.style.position = 'relative';
    iframeWrapper.style.height = `${slickItem1.getBoundingClientRect().height}px`;
    iframeWrapper.classList.add('slick-slide', 'slick-current', 'slick-active', 'slick-center')

    iframeElement = document.createElement('iframe');
    iframeElement.src = iframeSrc;
    iframeElement.width = '100%';
    iframeElement.style.setProperty('height', '100%', 'important');
    iframeElement.style.border = 'none';
    iframeElement.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; camera *; xr-spatial-tracking;";

    iframeWrapper.style.pointerEvents = 'none';
    iframeElement.style.pointerEvents = 'auto';
    iframeWrapper.appendChild(iframeElement);

    // Insert directly after the data-slick-index="1" element
    slickItem1.insertAdjacentElement('afterend', iframeWrapper);

    const resizeObserver = new ResizeObserver(() => {
        const updatedHeight = slickItem1.getBoundingClientRect().height;
        iframeWrapper.style.height = `${updatedHeight}px`;
    });
    resizeObserver.observe(slickItem1);
};


const setupThumbClickListeners = (thumbGallery) => {
    const thumbs = thumbGallery.children;

    for (let thumb of thumbs) {
        thumb.addEventListener('click', (e) => {
            e.preventDefault();

            const isMazingThumb = thumb.id === 'mazing-thumb';
            const iframeWrapper = iframeElement?.parentElement;

            if (!iframeWrapper) return;

            for (let t of thumbs) {
                t.classList.remove(
                    'swiper-slide-active',
                    'minimog-slide-active',
                    'swiper-slide-thumb-active'
                );

                const inner = t.querySelector('.iconic-woothumbs-thumbnails__slide');
                if (inner) {
                    inner.classList.remove('iconic-woothumbs-thumbnails__slide--active');
                }
            }

            thumb.classList.add(
                'swiper-slide-active',
                'minimog-slide-active',
                'swiper-slide-thumb-active'
            );

            const innerSlide = thumb.querySelector('.iconic-woothumbs-thumbnails__slide');
            if (innerSlide) {
                innerSlide.classList.add('iconic-woothumbs-thumbnails__slide--active');
            }

            if (isMazingThumb) {

                const iframeSlide = iframeElement?.closest('.slick-slide');
                const imageTrack = document.querySelector('.iconic-woothumbs-images .slick-track');

                if (iframeSlide && imageTrack) {
                    const scrollOffset = iframeSlide.offsetLeft;

                    imageTrack.scrollTo({
                        left: scrollOffset,
                        behavior: 'smooth',
                    });
                }
            }
        });
    }
};


const reindexThumbs = (thumbGallery) => {
    const thumbs = Array.from(thumbGallery.children);
    thumbs.forEach((thumb, i) => {
        thumb.setAttribute('data-slick-index', i);

        const inner = thumb.querySelector('.iconic-woothumbs-thumbnails__slide');
        if (inner) {
            inner.setAttribute('data-index', i);
        }
    });
};

const setupVariantListener = () => {
    const swatches = document.querySelectorAll('.swatchly-swatch');

    swatches.forEach(swatch => {
        swatch.addEventListener('click', async (e) => {
            const value = swatch.dataset.attr_value;
            console.log('Clicked Value:', value);

            iframeElement.contentWindow.postMessage({
                type: 'SWITCH_VARIANT',
                value: {
                    trigger: value
                }
            }, '*');

        });
    });
};

const handleResizeReinsertion = () => {
    const mazingThumb = document.getElementById('mazing-thumb');
    const iframeWrapper = iframeElement?.parentElement;

    if (mazingThumb && mazingThumb.parentElement) {
        mazingThumb.remove();
    }

    if (iframeWrapper && iframeWrapper.parentElement) {
        iframeWrapper.remove();
    }

    setTimeout(() => {
        console.log('Reinserting Mazing elements after resize...');
        const imgGallery = document.querySelector('.iconic-woothumbs-images .slick-track');
        const thumbGallery = document.querySelector('.iconic-woothumbs-thumbnails .slick-track');

        if (!imgGallery || !thumbGallery) return;

        insertIframe(imgGallery, iframeSrc);
        cloneAndInsertThumb(thumbGallery, 'https://cdn.mazing.link/assets/svg/3D.svg');
        reindexThumbs(thumbGallery);
        setupThumbClickListeners(thumbGallery);
    }, 400);
};


const initializeMazing = async () => {
    // GALLERY INTEGRATION

    // Wait for gallery elements
    const imgGallery = await waitForElement('.iconic-woothumbs-images .slick-track');
    const thumbGallery = await waitForElement('.iconic-woothumbs-thumbnails .slick-track');

    const myImageSrc = 'https://cdn.mazing.link/assets/svg/3D.svg';

    // this method returns the iframe src that we use in the iframe that we will later create
    iframeSrc = await mazingProjectAvailable({
        customerName: customer,
        getSKU: getCurrentSKU,
    });
    if (!iframeSrc) {
        console.log('iframeSrc not found, aborting script execution.');
        return;
    }

    // This creates the iframe and inserts it in the imgGallery at the 2. position
    insertIframe(imgGallery, iframeSrc);
    // This clones the first thumb and inserts it in the thumbGallery at the 2. position
    // We clone it so we still have the same thumb background to make the thumb look better
    cloneAndInsertThumb(thumbGallery, myImageSrc);
    reindexThumbs(thumbGallery);
    // This sets up the click listeners we apply on the thumbs
    setupThumbClickListeners(thumbGallery);
    setupVariantListener()
    console.log('Mazing initialized with clean DOM.');


    if (window.innerWidth > 768) {
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                console.log('Triggering Mazing reinsertion after resize settled.');
                handleResizeReinsertion();
            }, 800);
        });
    }

};


const initializeScript = async () => {
    try {
        // Wait for mazing function to be available
        await waitForMazingFunction;
        console.log('mazingProjectAvailable is now available');

        // Gallery integration
        await initializeMazing();
        console.log('Initialized successfully.');
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};
initializeScript();