export const getRoomId = (userId1 : any, userId2 : any) =>{
    const sortedIds = [userId1, userId2].sort();
    const roomId = sortedIds.join("-");
    return roomId
}