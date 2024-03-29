import React from 'react';
import { Table, HoverCard, Link, Text, Strong, Box } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '../../../Style/Slider.css';

interface SingleTableRowProps {
    name: string;
    qualityAspectValue: number;
    qualityAspectDescription: string;
    weightValue: number;
    sliderValue: number;
    recalculatedWeight: number;
    onSliderChange: (name: string, newImportance: number) => void;
}

const SingleTableRow: React.FC<SingleTableRowProps> = ({
    name,
    qualityAspectValue,
    qualityAspectDescription,
    weightValue,
    sliderValue,
    recalculatedWeight,
    onSliderChange,
}) => {

    return (
        <Table.Row>
            <Table.ColumnHeaderCell align='center' justify={'center'}>
                <HoverCard.Root>
                    <HoverCard.Trigger>
                        <Link href="#">{name}</Link>
                    </HoverCard.Trigger>
                    <HoverCard.Content>
                        <Text as="div" style={{ maxWidth: 325 }}>
                            <Strong>Meaning of {name}</Strong> : {qualityAspectDescription}
                        </Text>
                    </HoverCard.Content>
                </HoverCard.Root>
            </Table.ColumnHeaderCell>

            <Table.Cell align='center' justify={'center'}>{qualityAspectValue.toFixed(2)}</Table.Cell>
            <Table.Cell align='center' justify={'center'}>{weightValue.toFixed(2)}</Table.Cell> {/* Original weight value */}
            <Table.Cell align='center' justify={'center'}>
                <Box style={{ position: 'relative', padding: '20px' }}>
                    <Slider.Root
                        value={[sliderValue]}
                        onValueChange={(value) => onSliderChange(name, value[0])}
                        min={0}
                        max={1}
                        step={0.01}
                        className="SliderRoot">
                        <Slider.Track className="SliderTrack">
                            <Slider.Range className="SliderRange" />
                        </Slider.Track>
                        <Slider.Thumb className="SliderThumb" />
                    </Slider.Root>
                    <div style={{ position: 'absolute', top: '-2px', left: `${sliderValue * 100}%`, transform: 'translateX(-50%)' }}>
                        {sliderValue.toFixed(2)}
                    </div>
                </Box>
            </Table.Cell>
            <Table.Cell align='center' justify={'center'}>{recalculatedWeight.toFixed(2)}</Table.Cell>
        </Table.Row>
    );
};

export default SingleTableRow;
