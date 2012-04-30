/*global define*/
define(['Core/Quaternion', 'Core/Cartesian3'],
        function(Quaternion, Cartesian3) {
            "use strict";

            var doublesPerCartesian = 3;
            var doublesPerQuaternion = 4;

            var QuaternionDataHandler = {

                elementsPerItem : doublesPerQuaternion,

                elementsPerInterpolationItem : doublesPerCartesian,

                isSampled : function(packetData) {
                    return Array.isArray(packetData) && packetData.length > doublesPerQuaternion;
                },

                extractValueAt : function(index, data) {
                    index = index * QuaternionDataHandler.elementsPerItem;
                    return new Quaternion(data[index], data[index + 1], data[index + 2], data[index + 3]);
                },

                extractValue : function(data) {
                    return {
                        x : data[0],
                        y : data[1],
                        z : data[2],
                        w : data[3]
                    };
                },

                getPacketData : function(packet) {
                    return packet.quaternion;
                },

                extractInterpolationTable : function(valuesArray, destinationArray, firstIndex, lastIndex) {
                    var quaternion0Conjugate = QuaternionDataHandler.extractValueAt(lastIndex, valuesArray).conjugate();

                    for ( var i = 0, len = lastIndex - firstIndex + 1; i < len; i++) {
                        var offset = i * doublesPerCartesian, value = QuaternionDataHandler.extractValueAt(firstIndex + i, valuesArray), difference = value.multiply(quaternion0Conjugate);

                        if (difference.w < 0) {
                            difference = difference.negate();
                        }

                        if (difference.w === 1 && difference.x === 0 && difference.y === 0 && difference.z === 0) {
                            destinationArray[offset] = 0;
                            destinationArray[offset + 1] = 0;
                            destinationArray[offset + 2] = 0;
                        } else {
                            var axis = new Cartesian3(difference.x, difference.y, difference.z), magnitude = axis.magnitude(), angle = 2 * Math.atan2(magnitude, difference.w), axisX = axis.x /
                                    magnitude, axisY = axis.y / magnitude, axisZ = axis.z / magnitude;

                            destinationArray[offset] = axisX * angle;
                            destinationArray[offset + 1] = axisY * angle;
                            destinationArray[offset + 2] = axisZ * angle;
                        }
                    }
                },

                interpretInterpolationResult : function(result, valuesArray, firstIndex, lastIndex) {
                    var rotationVector = new Cartesian3(result[0], result[1], result[2]);
                    var magnitudeSquared = rotationVector.magnitudeSquared();
                    var quaternion0 = QuaternionDataHandler.extractValueAt(lastIndex, valuesArray);
                    var difference;

                    if (magnitudeSquared === 0) {
                        difference = new Quaternion(0, 0, 0, 1);
                    } else {
                        var magnitude = Math.sqrt(magnitudeSquared), angle = magnitude / 2.0, axisX = rotationVector.x / magnitude, axisY = rotationVector.y / magnitude, axisZ = rotationVector.z /
                                magnitude, c = Math.cos(angle), s = Math.sin(angle);

                        difference = new Quaternion(s * axisX, s * axisY, s * axisZ, c);
                    }

                    return difference.multiply(quaternion0);
                }
            };
            return QuaternionDataHandler;
        });