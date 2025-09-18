/**
 * TCX/GPX file parsing utilities for B2 Manual Workout Upload
 * Extracts workout data from XML files
 */

export interface ParsedWorkoutData {
  sport: 'run' | 'bike' | 'swim' | 'strength' | 'mobility';
  date: string; // ISO date string
  duration_minutes: number;
  distance_meters?: number;
  title?: string;
  source_format: 'tcx' | 'gpx';
  metadata: {
    device?: string;
    creator?: string;
    version?: string;
    trackpoints?: number;
  };
}

/**
 * Parse TCX file content
 * TCX (Training Center XML) format from Garmin and other devices
 */
export function parseTCX(xmlContent: string): ParsedWorkoutData {
  try {
    // Basic XML parsing - in production would use proper XML parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'application/xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }
    
    // Extract activity data
    const activity = doc.querySelector('Activity');
    if (!activity) {
      throw new Error('No Activity found in TCX file');
    }
    
    // Extract sport - default to 'run' if not specified
    const sportAttr = activity.getAttribute('Sport')?.toLowerCase();
    let sport: ParsedWorkoutData['sport'] = 'run';
    
    switch (sportAttr) {
      case 'running':
      case 'run':
        sport = 'run';
        break;
      case 'biking':
      case 'cycling':
      case 'bike':
        sport = 'bike';
        break;
      case 'swimming':
      case 'swim':
        sport = 'swim';
        break;
      case 'other':
        sport = 'strength'; // Default "other" to strength
        break;
      default:
        sport = 'run'; // Default fallback
    }
    
    // Extract start time
    const idElement = doc.querySelector('Id');
    if (!idElement?.textContent) {
      throw new Error('No start time found in TCX file');
    }
    
    const startTime = new Date(idElement.textContent);
    if (isNaN(startTime.getTime())) {
      throw new Error('Invalid start time in TCX file');
    }
    
    // Extract duration from laps or calculate from trackpoints
    let totalDuration = 0;
    const laps = doc.querySelectorAll('Lap');
    
    if (laps.length > 0) {
      laps.forEach(lap => {
        const durationSeconds = parseFloat(lap.querySelector('TotalTimeSeconds')?.textContent || '0');
        totalDuration += durationSeconds;
      });
    } else {
      // Calculate from first and last trackpoint if no laps
      const trackpoints = doc.querySelectorAll('Trackpoint Time');
      if (trackpoints.length >= 2) {
        const firstTime = new Date(trackpoints[0].textContent || '');
        const lastTime = new Date(trackpoints[trackpoints.length - 1].textContent || '');
        if (!isNaN(firstTime.getTime()) && !isNaN(lastTime.getTime())) {
          totalDuration = (lastTime.getTime() - firstTime.getTime()) / 1000;
        }
      }
    }
    
    // Extract total distance
    let totalDistance = 0;
    laps.forEach(lap => {
      const distanceMeters = parseFloat(lap.querySelector('DistanceMeters')?.textContent || '0');
      totalDistance += distanceMeters;
    });
    
    // Extract metadata
    const creator = doc.querySelector('Creator Name')?.textContent;
    const version = doc.querySelector('Creator Version')?.textContent;
    const trackpointCount = doc.querySelectorAll('Trackpoint').length;
    
    // Generate title
    const title = `${sport.charAt(0).toUpperCase() + sport.slice(1)} - ${startTime.toLocaleDateString()}`;
    
    return {
      sport,
      date: startTime.toISOString().split('T')[0], // ISO date
      duration_minutes: Math.round(totalDuration / 60),
      distance_meters: totalDistance > 0 ? Math.round(totalDistance) : undefined,
      title,
      source_format: 'tcx',
      metadata: {
        device: creator,
        version,
        trackpoints: trackpointCount
      }
    };
  } catch (error) {
    throw new Error(`TCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse GPX file content
 * GPX (GPS Exchange Format) standard
 */
export function parseGPX(xmlContent: string): ParsedWorkoutData {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'application/xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }
    
    // Extract track data
    const tracks = doc.querySelectorAll('trk');
    if (tracks.length === 0) {
      throw new Error('No tracks found in GPX file');
    }
    
    // Use first track
    const track = tracks[0];
    const trackName = track.querySelector('name')?.textContent || 'GPX Workout';
    
    // Extract track segments and points
    const trackPoints = track.querySelectorAll('trkpt');
    if (trackPoints.length === 0) {
      throw new Error('No track points found in GPX file');
    }
    
    // Calculate duration from first and last point with time
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    
    for (const point of trackPoints) {
      const timeElement = point.querySelector('time');
      if (timeElement?.textContent) {
        const pointTime = new Date(timeElement.textContent);
        if (!isNaN(pointTime.getTime())) {
          if (!startTime) startTime = pointTime;
          endTime = pointTime;
        }
      }
    }
    
    if (!startTime) {
      throw new Error('No timestamp found in GPX file');
    }
    
    const duration = endTime && startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;
    
    // Calculate distance between consecutive points
    let totalDistance = 0;
    let prevLat: number | null = null;
    let prevLon: number | null = null;
    
    trackPoints.forEach(point => {
      const lat = parseFloat(point.getAttribute('lat') || '0');
      const lon = parseFloat(point.getAttribute('lon') || '0');
      
      if (prevLat !== null && prevLon !== null) {
        totalDistance += calculateHaversineDistance(prevLat, prevLon, lat, lon);
      }
      
      prevLat = lat;
      prevLon = lon;
    });
    
    // Determine sport - GPX doesn't specify, so infer from distance/speed
    let sport: ParsedWorkoutData['sport'] = 'run';
    
    if (duration > 0 && totalDistance > 0) {
      const avgSpeedKmh = (totalDistance / 1000) / (duration / 3600);
      
      // Rough heuristics for sport detection
      if (avgSpeedKmh > 25) {
        sport = 'bike'; // Likely cycling if > 25 km/h average
      } else if (avgSpeedKmh < 2) {
        sport = 'strength'; // Very slow, likely walking/strength
      } else {
        sport = 'run'; // Default to running
      }
    }
    
    // Extract metadata
    const creator = doc.querySelector('creator')?.textContent;
    const version = doc.querySelector('version')?.textContent;
    
    return {
      sport,
      date: startTime.toISOString().split('T')[0],
      duration_minutes: Math.round(duration / 60),
      distance_meters: totalDistance > 0 ? Math.round(totalDistance) : undefined,
      title: trackName,
      source_format: 'gpx',
      metadata: {
        creator,
        version,
        trackpoints: trackPoints.length
      }
    };
  } catch (error) {
    throw new Error(`GPX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate distance between two lat/lon points using Haversine formula
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Parse workout file based on format
 */
export function parseWorkoutFile(fileContent: string, fileType: 'tcx' | 'gpx'): ParsedWorkoutData {
  switch (fileType) {
    case 'tcx':
      return parseTCX(fileContent);
    case 'gpx':
      return parseGPX(fileContent);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Validate parsed workout data
 */
export function validateParsedData(data: ParsedWorkoutData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.sport) {
    errors.push('Sport is required');
  }
  
  if (!data.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }
  
  if (!data.duration_minutes || data.duration_minutes <= 0) {
    errors.push('Duration must be greater than 0');
  }
  
  // Sanity checks
  if (data.duration_minutes > 24 * 60) {
    errors.push('Duration cannot exceed 24 hours');
  }
  
  if (data.distance_meters && data.distance_meters < 0) {
    errors.push('Distance cannot be negative');
  }
  
  if (data.distance_meters && data.distance_meters > 1000000) {
    errors.push('Distance cannot exceed 1000km');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
