# Acknowledgement

Original source code copied from [jkanchelov / material-ui-quiz-app](https://github.com/jkanchelov/material-ui-quiz-app)

# From Source

```
    npm install --save-dev style-loader css-loader babel-loader @babel/core @babel/cli @babel/preset-env @babel/preset-react react react-dom @material-ui/core @material-ui/icons
	npm install --save-dev react-svg-loader react-transition-group
```

Or in parent folder,

```
   npm install --save-dev
```

# Docker Memo

For Docker Nginx.

```
    docker build -t react-quiz .
    docker rm quiz
    docker run --name quiz -dp 80:80 -t react-quiz
```
