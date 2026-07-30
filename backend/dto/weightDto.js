function toWeightDto(weightLog) {
    return {
        id: weightLog.id,
        weight: weightLog.weight,
        logdate: weightLog.logdate,
    };
}

function toWeightListDto(weightLogs) {
    return weightLogs.map(toWeightDto);
}

module.exports = { toWeightDto, toWeightListDto };
