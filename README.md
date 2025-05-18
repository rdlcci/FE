## How to get started
- Install node.js fom site 20.x.x
- it will come with nvm
- might have to install npm
### for vite with react (to build fast)
- npm create vite@latest first-app -- --template react
- cd first-app
- npm install
- npm run dev <- why dev?
- open the browser link

### Clean slate
```src/App.jsx
function App() {
  return <></>;
}

export default App;
```
- blank src/App.css
- blank src/index.css
- the result will be instantly reflected in the browser (vite power)
- rename in index.html
- remove assets
- change the icon from vite to locally in assets
        <link rel="icon" type="image/png" href="/assets/favicon.png" />
    - add icon in public and call it like
    <link rel="icon" type="image/x-icon" href="/lilly.ico" />


## How to build something (vibe-ish)
### chat like interface
``` prompt
step by step guide  to someone who doesn know anything about react or javascript how to make a layout where 
1. there is a side bar on the left
2. it has a logo on the top 1/3rd of the page
3. in the bottom 1/5th it has a user name and designation; like the person who has logged in
4. in the middle of the side bar it shows previously asked questions in chat, which is clickable; if its long then it shouldn show the whole line just some words and then ...; when hovered must show the whole thing in a tooltip
5. in the main part of the site:
6. the bottom should have a user intput area with a send button
7. when the user entry is not blank and the send button is clicked, the user message is populated above just above the user input area but before a jumping animation that says generating ...
8. beside the generating ... there sholuld be a clickable icon like a stop button
9. when the send button is clicked it should send the user input to a backend api and get the answer from backend api
10. when the answer from backend api is received, the animation and generating ... with the stop icon should disappear and must show the api returned text or table or image or json.
11. and below this content there should be a clickable retyr icon which calls the backend api once again with the last user entry 
12. there should also be a thumbs up and thumbs down clickable button that stores user name, time of click, the icons name, the user input and backend's response in a local database
13. choose a fast storing, it can be redis or anythignt hats fast and stores well
14. the backend api is not to be build as it will be dealt with separately in python later.
```
``` prompt to make side bar questions dynamic
Example chat items , how to make it dynamic, so that it adds to the list of user inputs as soons as user asks
```
``` prompt backend integration
there is a backend server on http://localhost:8000 called @app.post("/api/analysis/summarize")
how to send user input and get the output form that, explain step by step
```