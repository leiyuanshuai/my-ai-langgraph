// @ts-ignore
import logo from './ant-design.svg';
import './HomePage.scss';

export default function () {
  return (
    <h1 className="home-page">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </h1>
  );
};
