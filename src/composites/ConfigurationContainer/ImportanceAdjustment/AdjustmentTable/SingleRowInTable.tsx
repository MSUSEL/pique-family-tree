import React from 'react';
import { Table, HoverCard, Link, Text, Strong, Box } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '../../../Style/Slider.css';
import { SliderMode } from './AdjustmentTableUI';

interface SingleTableRowProps {
    name: string;
    //qualityAspectValue: number;
    qualityAspectDescription: string;
    characteristicValue: number;
    characteristicSlider: number;
    weightValue: number;
    importanceSlider: number;
    recalculatedWeight: number;
    onSliderChange: (name: string, newImportance: number, mode : SliderMode) => void;
}

const SingleTableRow: React.FC<SingleTableRowProps> = ({
    name,
    //qualityAspectValue,
    qualityAspectDescription,
    characteristicValue,
    characteristicSlider,
    weightValue,
    importanceSlider,
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
            <Table.Cell align='center' justify={'center'}>
                {characteristicValue.toFixed(2)}
            </Table.Cell>
            <Table.Cell align='center' justify={'center'}>
                <Box style={{ position: 'relative', padding: '20px' }}>
                    <Slider.Root
                        value={[characteristicSlider]}
                        onValueChange={(value) => onSliderChange(name, value[0], SliderMode.characteristics)}
                        min={0}
                        max={1}
                        step={0.01}
                        className="SliderRoot">
                        <Slider.Track className="SliderTrack">
                            <Slider.Range className="SliderRange" />
                        </Slider.Track>
                        <Slider.Thumb className="SliderThumb" />
                    </Slider.Root>
                    <div style={{ position: 'absolute', top: '-2px', left: `${characteristicSlider * 100}%`, transform: 'translateX(-50%)' }}>
                        {characteristicSlider.toFixed(2)}
                    </div>
                </Box>
            </Table.Cell>
            <Table.Cell align='center' justify={'center'}>
                {weightValue.toFixed(2)}
            </Table.Cell>
            <Table.Cell align='center' justify={'center'}>
                <Box style={{ position: 'relative', padding: '20px' }}>
                    <Slider.Root
                        value={[importanceSlider]}
                        onValueChange={(value) => onSliderChange(name, value[0], SliderMode.importance)}
                        min={0}
                        max={1}
                        step={0.01}
                        className="SliderRoot">
                        <Slider.Track className="SliderTrack">
                            <Slider.Range className="SliderRange" />
                        </Slider.Track>
                        <Slider.Thumb className="SliderThumb" />
                    </Slider.Root>
                    <div style={{ position: 'absolute', top: '-2px', left: `${importanceSlider * 100}%`, transform: 'translateX(-50%)' }}>
                        {importanceSlider.toFixed(2)}
                    </div>
                </Box>
            </Table.Cell>
            <Table.Cell align='center' justify={'center'}>
                {recalculatedWeight.toFixed(2)}
            </Table.Cell>
            <Table.Cell align='center' justify={'center'}>
                {(characteristicSlider -recalculatedWeight).toFixed(2)}
            </Table.Cell>
        </Table.Row>
    );
};

export default SingleTableRow;
