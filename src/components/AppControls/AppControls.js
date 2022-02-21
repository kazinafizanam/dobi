import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { conference } from '@voxeet/voxeet-web-sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophoneAlt, faMicrophoneAltSlash,
  faVideo, faVideoSlash, faLink, faPhoneAlt,
  faShareSquare
} from '@fortawesome/free-solid-svg-icons';

import {
  startVideo, stopVideo,
  startAudio, stopAudio,
  startScreenShare, stopScreenShare
} from '../../utils/voxeetUtils';
import { Button, Overlay } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';


export default function AppControls({ shareable }) {
  const [isUserVideoActive, setIsUserVideoActive] = useState(true);
  const [isUserAudioActive, setIsUserAudioActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareButtonRef = useRef(null);

  const shareableLink = useMemo(() => {
    const url = new URL(window.location.href);
    const parentURL = url.searchParams.get('parentURL');
    const newClip = parentURL || window.location.href;

    //console.log('New Clip', newClip);
    return newClip;
  }, []);

  useEffect(() => {
    console.log('video', isUserVideoActive);
    console.log('audio', isUserAudioActive);
  }, [isUserAudioActive, isUserVideoActive]);

  // Event handlers
  const handleVideoButton = useCallback(({ isStart }) => {
    isStart ? stopVideo() : startVideo();

    setIsUserVideoActive(!isStart);
  }, []);

  const handleAudioButton = useCallback(({ isStart }) => {
    isStart ? stopAudio() : startAudio();

    setIsUserAudioActive(!isStart);
  }, []);

  const handleEndCall = useCallback(() => {
    conference.leave()
      .then(() => console.log("left Conference"))
  }, []);

  const handleShareScreen = useCallback(({ isStart }) => {
    isStart ? stopScreenShare() : startScreenShare();
    setIsScreenSharing(!isStart);
  }, []);

  return (
    <div className="app-controls d-flex justify-content-between align-items-center p-3 rounded">
      {/* Start/Stop Audio and Video */}
      <Button
        variant={!isUserAudioActive ? 'secondary' : 'primary'}
        onClick={() => handleAudioButton({ isStart: isUserAudioActive })}
        className='rounded-circle'
        style={{ width: '50px', height: '50px' }}
      >
        <FontAwesomeIcon icon={isUserAudioActive ? faMicrophoneAlt : faMicrophoneAltSlash} size='2x' />
      </Button>
      <Button
        variant={!isUserVideoActive ? 'secondary' : 'primary'}
        onClick={() => handleVideoButton({ isStart: isUserVideoActive })}
        className='rounded-circle'
        style={{ width: '50px', height: '50px' }}
      >
        <FontAwesomeIcon icon={isUserVideoActive ? faVideo : faVideoSlash} size='2x' />
      </Button>

      {/* End Call */}
      <Button
        variant='danger'
        onClick={() => handleEndCall()}
        className='rounded-circle mx-3'
        style={{ width: '60px', height: '60px' }}
      >

        <FontAwesomeIcon icon={faPhoneAlt} flip="both" size='2x' />
      </Button>

      {/* Share Screen and Share Link */}
      <Button
        variant={!isScreenSharing ? 'secondary' : 'success'}
        onClick={() => handleShareScreen({ isStart: isScreenSharing })}
        className='rounded-circle'
        style={{ width: '50px', height: '50px' }}
      >
        <FontAwesomeIcon icon={faShareSquare} size='2x' />
      </Button>

      {
        shareable &&
        <>
          <CopyToClipboard
            text={shareableLink} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 3000) }}>
            <div>
              <Button
                ref={shareButtonRef}
                variant={copied ? 'success' : 'light'}
                className='rounded-circle'
                style={{ width: '50px', height: '50px' }}
              >
                <FontAwesomeIcon icon={faLink} size='2x' />
              </Button>

              <Overlay target={shareButtonRef.current} show={copied} placement="top">
                {({ placement, arrowProps, show: _show, popper, ...props }) => (
                  <span
                    {...props}
                    className='bg-success'
                    style={{
                      padding: '2px 10px',
                      color: 'white',
                      borderRadius: 3,
                      fontSize: '1.5rem',
                      ...props.style,
                    }}
                  >
                    Copied the Share Link
                  </span>
                )}
              </Overlay>
            </div>
          </CopyToClipboard>
        </>
      }
    </div >
  )
}