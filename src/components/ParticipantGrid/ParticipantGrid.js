import React, { useEffect, useState, useRef, useCallback } from 'react';
import { conference, session } from '@voxeet/voxeet-web-sdk';

import ParticipantGridItem from './ParticipantGridItem';
import { Spinner } from 'react-bootstrap';
import classNames from 'classnames';


export default function ParticipantGrid({ isLoaded }) {
  const [participantList, setParticipantList] = useState([]);
  const participantGridRef = useRef(null);

  const streamUpdatedCallback = useCallback((participant, stream) => {
    // Handle Video
    const thisParticipantIndex = participantList.findIndex(el => el.id === participant.id);

    // If participant not found
    if (thisParticipantIndex === -1) {
      let nameToAdd;

      // Check if participant is user
      if (session.participant.id === participant.id) {
        nameToAdd = participant.info.name + " (you)";
      } else {
        nameToAdd = participant.info.name;
      }

      // Create participant object
      const newParticipant = {
        name: nameToAdd,
        id: participant.id,
        participant: participant,
        stream: stream,
        isVideo: stream.getVideoTracks().length > 0,
        isInactive: false,
      };

      // Update Participants List
      setParticipantList([...participantList, newParticipant]);
    } else {
      const newParticipantList = [...participantList];

      const updatedDetails = {
        name: newParticipantList[thisParticipantIndex].name,
        id: participant.id,
        participant: participant,
        stream: stream,
        isVideo: stream.getVideoTracks().length > 0,
        isInactive: false,
      }

      newParticipantList[thisParticipantIndex] = updatedDetails;
      setParticipantList(newParticipantList);
    }

  }, [participantList]);

  const streamRemovedCallback = useCallback((participant, stream) => {
    if (participant.status === 'Left') return;

    const thisParticipentIndex = participantList.findIndex(el => el.id === participant.id);

    const newParticipantList = [...participantList];
    const newDetails = {
      name: newParticipantList[thisParticipentIndex].name,
      id: participant.id,
      participant: participant,
      stream: stream,
      isVideo: false,
      isInactive: true,
    };

    newParticipantList[thisParticipentIndex] = newDetails;

    setParticipantList(newParticipantList);
  }, [participantList]);

  const participantUpdatedCallback = useCallback((participant, stream) => {
    if (participant.status === 'Left') {
      // remove from list
      const newParticipantList = [...participantList].filter(
        (el) => el.id !== participant.id
      );
      setParticipantList(newParticipantList);
    }
  }, [participantList]);

  useEffect(() => {
    conference.on('streamAdded', streamUpdatedCallback);
    conference.on('streamUpdated', streamUpdatedCallback);
    conference.on('streamRemoved', streamRemovedCallback);
    conference.on('participantUpdated', participantUpdatedCallback);

    return () => {
      conference.off('streamAdded', streamUpdatedCallback);
      conference.off('streamUpdated', streamUpdatedCallback);
      conference.off('streamRemoved', streamRemovedCallback);
      conference.off('participantUpdated', participantUpdatedCallback);
    };
  }, [
    participantList,
    streamUpdatedCallback,
    streamRemovedCallback,
    participantUpdatedCallback,
  ]);

  // Set up the Grid items
  const items = participantList.map(participant => {
    if (isLoaded) {
      return (
        <div key={participant.id} className={classNames("col d-flex flex-column justify-content-center", { "col-md-6": participantList.length > 1 })}>
          <ParticipantGridItem
            key={participant.id}
            isLoaded={isLoaded}
            participantInfo={participant}
            isSelf={participant.id === session.participant.id}
          />
        </div>
      );
    } else {
      return (
        <div key={participant.id} className='text-center text-danger'>
          Video Not Loaded Yet
        </div>
      );
    }
  });

  if (isLoaded) {
    return (
      <div className="participant-grid row gy-3" ref={participantGridRef}>
        {items}
      </div>
    );
  } else {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="dark" />
      </div>
    )
  }
}
