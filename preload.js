const tribune_data = {
	posts: []
};

function isSameOrigin(urlString) {
    const url = new URL(urlString);
    const currentUrl = new URL(window.location.href);
    return (url.origin === currentUrl.origin);
}
