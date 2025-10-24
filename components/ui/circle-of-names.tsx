import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';


interface CircleOfNamesProps {
names: string[];
radius?: number;
}


export default function CircleOfNames({ names, radius = 130 }: CircleOfNamesProps) {
const angleStep = (2 * Math.PI) / names.length;
const { width, height } = Dimensions.get('window');
const centerX = width / 2;
const centerY = height / 2;


return (
<View style={[styles.container, { height: height }]}>
{names.map((name, index) => {
const angle = index * angleStep - Math.PI / 2;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);


return (
<View
key={index}
style={[styles.nameContainer, {
left: centerX + x - 40,
top: centerY + y - 20,
}]}
>
<Text style={styles.nameText}>{name}</Text>
</View>
);
})}
</View>
);
}


const styles = StyleSheet.create({
container: {
position: 'relative',
justifyContent: 'center',
alignItems: 'center',
flex: 1,
},
nameContainer: {
position: 'absolute',
width: 80,
height: 40,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'rgba(255,255,255,0.1)',
borderRadius: 20,
borderWidth: 1,
borderColor: 'rgba(255,255,255,0.3)',
},
nameText: {
color: '#fff',
fontSize: 14,
textAlign: 'center',
},
});