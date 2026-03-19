import './App.css';
// import Avatar from './Avatar';
import { useImages } from './useImages4';




const App = () => {

  const imageUrl = "http://103.186.108.161:5015/imgs/06e5b950405c65eadfe37d1a227fb170.jpg";
  const { src, loading, error, success } = useImages(imageUrl);

  console.log('src',src)
  console.log('loading',loading)
  console.log('error',error)
  console.log('success',success)


  
  return (
    <div className="content">

      <img src={src} />
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>

  );
};

export default App;
