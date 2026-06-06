# loveKahEn 💛

A pure-frontend anniversary page. No server, no build step — just open `index.html`
in a browser.

## How it works
The page is a "table". Every tap/click throws the current pop-up onto the table
(where it stays, scattered) and reveals a new random one — either a message
(styled like a real chat bubble) or an image.

## Run it
Open `index.html` directly, or serve the folder:

```sh
# optional local server (any of these)
python -m http.server 8000
# then visit http://localhost:8000
```

## Structure
```
index.html        # markup
styles/style.css  # styling
scripts/main.js   # interaction logic + content
assets/images/    # your photos (added later)
```

## TODO
- [ ] Real chat-bubble styling for messages
- [ ] Image pop-ups
- [ ] "Throw to table" scatter animation/rotation
- [ ] Replace lorem ipsum with real messages
- [ ] Add real photos
```
