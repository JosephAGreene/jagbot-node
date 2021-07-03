function collectionResponse (selectedModule, messageContent) {
    let response = null;
    
    //Determine collection keyword
    const collectionKeyword = messageContent.split(" ")[1];

    //Determine if options list for collection reply has correlated keyword
    for (let i = 0; i < selectedModule.options.length; i++) {
        if (selectedModule.options[i].keyword === collectionKeyword) {
            response = selectedModule.options[i].response;
            break;
        }
    }
    
    return response;
}

exports.collectionResponse = collectionResponse;