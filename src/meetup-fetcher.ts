import { GraphQLClient, gql } from "graphql-request";

const meetupApiEndPoint = "https://api.meetup.com/gql";

export interface GroupEvent {
  title: string;
  dateTime: Date;
  eventUrl: string;
}

export const GetUpcomingEvents = async (
  meetupGroupName: string
): Promise<GroupEvent[]> => {
  const client = new GraphQLClient(meetupApiEndPoint);
  const queryResult = await queryUpcomingEvents(client, meetupGroupName);
  let eventsList: GroupEvent[] = queryResult?.map(
    (r: any) =>
      <GroupEvent>{
        title: r.node.title,
        dateTime: new Date(r.node?.dateTime),
        eventUrl: r.node.eventUrl,
      }
  );
  return eventsList;
};

const queryUpcomingEvents = async (
  client: GraphQLClient,
  meetupGroupName: string,
  cursor: string = ""
): Promise<any> => {
  const query = gql`
    query ($meetupGroupName: String! ${!!cursor ? ", $cursor: String!" : ""} ) {
      groupByUrlname(urlname: $meetupGroupName) {
        name
        unifiedUpcomingEvents(input: { first: 20 ${
          !!cursor ? ", after: $cursor" : ""
        } }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              dateTime
              eventUrl
            }
          }
        }
      }
    }
  `;

  const variables = {
    meetupGroupName,
    cursor,
  };

  try {
    const clientResponse = await client.request(query, variables);
    const upcomingEvents = clientResponse.groupByUrlname?.unifiedUpcomingEvents;

    let nextPageResults = [];
    if (
      upcomingEvents.pageInfo?.hasNextPage === true &&
      upcomingEvents.pageInfo?.endCursor
    ) {
      nextPageResults = await queryUpcomingEvents(
        client,
        meetupGroupName,
        upcomingEvents.pageInfo?.endCursor
      );
    }

    return [...upcomingEvents.edges, ...nextPageResults];
  } catch (er) {
    console.error(er);
    return [];
  }
};
