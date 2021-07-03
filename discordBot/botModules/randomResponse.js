function randomResponse (selectedModule, messageContent) {
    // Determine random number by using the length of the responses array
    let randomPosition = Math.floor(Math.random() * selectedModule.responses.length);

    // If a response exists in the responses array that correlates to the randomPosition number,
    // then set response to it. Otherwise, set response to false.
    let response = (selectedModule.responses[randomPosition] 
                ? selectedModule.responses[randomPosition]
                : false);
    
    return response;
}

exports.randomResponse = randomResponse;