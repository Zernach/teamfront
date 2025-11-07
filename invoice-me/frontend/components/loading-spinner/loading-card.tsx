import React from 'react';
import { CustomCard } from 'components/custom-card/custom-card';
import { LoadingSpinner } from './loading-spinner';
import { PADDING } from 'constants/styles/commonStyles';
import { ViewStyle } from 'react-native';

export const LoadingCard = ({
    style,
    spinnerStyle,
}: {
    style?: ViewStyle;
    spinnerStyle?: ViewStyle;
}) => {
    return (
        <CustomCard
            renderFooter={null}
            renderHeader={
                <LoadingSpinner
                    animating={true}
                    style={[
                        {
                            flex: 1,
                            marginTop: PADDING * 3,
                        },
                        spinnerStyle,
                    ]}
                />
            }
            renderMiddle={null}
            style={style}
        />
    );
};
