import { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import {
  createConference, joinConference,
  startVideo
} from './utils/voxeetUtils';
import ParticipantGrid from './components/ParticipantGrid';
import AppControls from './components/AppControls';
import LocationTime from './components/LocationTime';
import './App.scss';
import { Form } from 'react-bootstrap';
import classNames from 'classnames';


// The ID of the map cell we are in.
const params = new URLSearchParams(window.location.search);
const cell = params.get('cell') || 'test123456789';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hoverControls, setHoverControls] = useState(true);

  useEffect(() => {
    try {
      if (cell) {
        createConference(cell).then(conf => {
          joinConference(conf).then(conf => {
            startVideo(conf).then(conf => {
              setIsLoaded(true);
              //console.log(conf);
            })
          })
        })
      } else {
        console.log('No cell');
      }
    } catch(err) {
      console.error(err);
    }
  }, []);

  return (
    <CSSTransition
      timeout={300}
      classNames='conference'
    >
      <div className="conference-container d-flex flex-column align-items-center mw-100 w-100 mh-100 h-100">
        <header className="py-3 mt-3 text-center mw-100">
          <h1 className="location-time">
            <LocationTime />
          </h1>
        </header>
        <div className="flex-grow-1 mb-5 container-xl d-flex justify-content-center overflow-hidden">
          <ParticipantGrid isLoaded={isLoaded} />
        </div>
        <div className='conference-controls p-4 d-flex justify-content-center align-items-center' onMouseOver={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
          
          <CSSTransition
            in={showControls}
            timeout={3000}
            classNames='controls'
          >
            <div className={classNames('control-hub', { 'hovering-controls': hoverControls })}>
              <AppControls shareable />
            </div>
          </CSSTransition>
          <div className='position-absolute end-0 me-5 fs-4'>
            <Form.Check
              type="switch"
              label='Controls On Hover'
              checked={hoverControls}
              onChange={() => setHoverControls(!hoverControls)}
            />
          </div>
        </div>
      </div>
    </CSSTransition>
  );
}

export default App;
