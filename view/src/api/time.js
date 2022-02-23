export const addDriveTime = (departureTime, driveTime) => {
  const originalMinutes = timeStringToMinutes(departureTime);
  const endMinutes = originalMinutes + driveTime;
  return minutesToTimeString(endMinutes);
}

export const subtractDriveTime = (arrivalTime, driveTime) => {
  const originalMinutes = timeStringToMinutes(arrivalTime);
  const endMinutes = originalMinutes - driveTime;
  return minutesToTimeString(endMinutes);
}

export const findNewPickupTime = (newSchoolArrival, originalSchoolArrival, originalStopArrival) => {
  const originalSchoolMinutes = timeStringToMinutes(originalSchoolArrival);
  const originalStopMinutes = timeStringToMinutes(originalStopArrival);
  const newSchoolMinutes = timeStringToMinutes(newSchoolArrival);
  const newPickupMinutes = newSchoolMinutes - (originalSchoolMinutes - originalStopMinutes);
  return minutesToTimeString(newPickupMinutes);
}

export const findNewDropOffTime = (newSchoolDeparture, originalSchoolDeparture, originalStopDeparture) => {
  const originalSchoolMinutes = timeStringToMinutes(originalSchoolDeparture);
  const originalStopMinutes = timeStringToMinutes(originalStopDeparture);
  const newSchoolMinutes = timeStringToMinutes(newSchoolDeparture);
  const newDropOffMinutes = newSchoolMinutes + (originalStopMinutes - originalSchoolMinutes);
  return minutesToTimeString(newDropOffMinutes);
}

export const timeStringToMinutes = (timeString) => {
  const split = timeString.split(":");
  const hours = parseInt(split[0]);
  const minutes = parseInt(split[1]);
  return hours*60 + minutes;
}

export const minutesToTimeString = (minutes) => {
  const remainderMinutes = minutes % 1440;
  const dayMinutes = remainderMinutes < 0 ? 1440 + remainderMinutes : remainderMinutes;
  const hours = Math.trunc(dayMinutes / 60);
  const extraMinutes = dayMinutes % 60;
  if (hours < 10 && extraMinutes < 10) {
    return `0${hours}:0${extraMinutes}`;
  } else if (hours < 10) {
    return `0${hours}:${extraMinutes}`;
  } else if (extraMinutes < 10) {
    return `${hours}:0${extraMinutes}`;
  }
  return `${hours}:${extraMinutes}`;
}

export const getDisplayTime = (time) => {
  const timeSplit = time.split(':');
  const hours = parseInt(timeSplit[0]);
  const minutes = timeSplit[1];
  if (hours > 12) {
    return `${hours - 12}:${minutes} PM`;
  } else if (hours === 0) {
    return `12:${minutes} AM`;
  } else if (hours < 12) {
    return `${hours}:${minutes} AM`
  } else {
    return `${hours}:${minutes} PM`;
  }
}
