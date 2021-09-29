import { GetUpcomingEvents } from './meetup-fetcher'


(async () => {
  try {
      var result = await GetUpcomingEvents("Hamburg-Hikers")
      console.log(result)
  } catch (e) {
  }
})();