# Weather API

API REST consumida por la app de clima.

- [**Demo de la App**](https://weather-app-front-indol.vercel.app) |
  [**Repo de la App**](https://github.com/marcesdan/weather-app-front)

- [**Demo de la API**](https://weather-app-api-pzz2.onrender.com) |
  [**Repo de la API**](https://github.com/marcesdan/weather-app-api)

## Endpoints

- `GET /api/v1/onecall?lat={latitude}&lon={longitude}`
- `GET /api/v1/ip-api?ip={ip_address}`
- `GET /api/v1/geo/direct?city={city_name}`
- `GET /api/v1/geo/reverse?lat={latitude}&lon={longitude}`

> Para poder ejecutar la api en forma local, es necesario generar una api key en Open Weather Map, y suscribirse al servicio One Call 3.0. Luego poner esa api key en la variable de entorno `OPEN_WEATHER_MAP_API_KEY`.
> Puede seguir las instrucciones [aqui](https://openweathermap.org/api/one-call-3)

## Estructura de directorios

- 📦src
- ┣ 📂api
- ┃ ┣ 📂v1
- ┃ ┃ ┣ 📂geo
- ┃ ┃ ┃ ┣ 📂controller
- ┃ ┃ ┃ ┗ 📂routes
- ┃ ┃ ┣ 📂ip-api
- ┃ ┃ ┃ ┣ 📂controller
- ┃ ┃ ┃ ┗ 📂routes
- ┃ ┃ ┗ 📂onecall
- ┃ ┃ ┃ ┣ 📂controller
- ┃ ┃ ┃ ┗ 📂routes
- ┃ ┗ 📂v2
- ┣ 📂interfaces
- ┣ 📂services
- ┗ 📂utils
- 📦test

</br>
</br>

How to use this template:

```sh
npx create-express-api --typescript --directory my-api-name
```

Includes API Server utilities:

- [morgan](https://www.npmjs.com/package/morgan)
  - HTTP request logger middleware for node.js
- [helmet](https://www.npmjs.com/package/helmet)
  - Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
- [dotenv](https://www.npmjs.com/package/dotenv)
  - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`
- [cors](https://www.npmjs.com/package/cors)
  - CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

Development utilities:

- [typescript](https://www.npmjs.com/package/typescript)
  - TypeScript is a language for application-scale JavaScript.
- [ts-node](https://www.npmjs.com/package/ts-node)
  - TypeScript execution and REPL for node.js, with source map and native ESM support.
- [nodemon](https://www.npmjs.com/package/nodemon)
  - nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
- [eslint](https://www.npmjs.com/package/eslint)
  - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- [typescript-eslint](https://typescript-eslint.io/)
  - Tooling which enables ESLint to support TypeScript.
- [jest](https://www.npmjs.com/package/jest)
  - Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
- [supertest](https://www.npmjs.com/package/supertest)
  - HTTP assertions made easy via superagent.
- Husky + Lint-Staged + Eslint + Prettier

## Setup

```bash
cp .env.example
```

```bash
npm install
```

## Lint

```bash
npm run lint
```

## Test

```bash
npm run test
```

## Development

```bash
npm run dev
```
