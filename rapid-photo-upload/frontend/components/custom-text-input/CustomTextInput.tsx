import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TextInputProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import {
    COLORS,
    DEFAULT_BORDER_COLOR,
    TEXT_INPUT_COLORS,
} from 'constants/colors';
import { Feather } from '@expo/vector-icons';
import { FONT_FAMILIES, FONT_SIZES } from 'constants/typography';
import { height, size } from 'react-native-responsive-sizes';
import {
    MAX_FONT_SIZE_MULTIPLIER,
} from 'constants/constants';
import { CustomText } from 'components/custom-text/CustomText';
import { PADDING } from 'constants/styles/commonStyles';
import { DEFAULT_BORDER_RADIUS, DEFAULT_BORDER_WIDTH } from 'constants/Styles';
import { CustomButton } from 'components/custom-button';
import { CustomLabel } from 'components/custom-label';

export type CustomTextInputProps = {
    id?: string;
    label?: string;
    title?: string;
    style?: ViewStyle;
    initialValue?: string | undefined;
    onChangeText?: (text: any) => void;
    onSubmitEditing?: TextInputProps['onSubmitEditing'];
    textInputStyle?: TextInputProps['style'];
    multiline?: TextInputProps['multiline'];
    placeholder?: TextInputProps['placeholder'];
    autoCorrect?: TextInputProps['autoCorrect'];
    autoCapitalize?: TextInputProps['autoCapitalize'];
    keyboardType?: TextInputProps['keyboardType'];
    maxLength?: TextInputProps['maxLength'];
    errorMessage?: string;
    setErrorMessage?: (message: string) => void;
    formattedText?: string;
    inputAccessoryViewID?: string;
    autoFocus?: boolean;
    onBlur?: (text: string) => void;
    onFocus?: () => void;
    onPressAddMessage?: () => void;
    labelInformationIconText?: string;
    inputContainerStyle?: {
        borderColorFocused: string;
        borderColorNotFocused: string;
    };
    isEditable?: boolean;
    hasValue?: boolean;
    isPasswordField?: boolean;
    returnKeyType?: TextInputProps['returnKeyType'];
    submitBehavior?: TextInputProps['submitBehavior'];
};

export const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
    (props, ref) => {
        const {
            id,
            label,
            title,
            style,
            autoFocus,
            multiline = false,
            placeholder,
            autoCorrect,
            onChangeText,
            onSubmitEditing,
            initialValue,
            autoCapitalize,
            textInputStyle,
            inputAccessoryViewID,
            labelInformationIconText,
            keyboardType = 'default',
            maxLength,
            errorMessage,
            onBlur,
            onFocus,
            formattedText,
            onPressAddMessage,
            inputContainerStyle,
            isEditable,
            hasValue,
            returnKeyType,
            submitBehavior,
            isPasswordField,
        } = props;
        const inputRef = useRef<TextInput>(null);
        useImperativeHandle(ref, () => inputRef.current as TextInput);
        const defaultValueRef = useRef(initialValue?.toString() ?? '');
        const valueRef = useRef(initialValue ?? '');
        const [isFocused, setIsFocused] = useState(false);
        const [passwordVisible, setPasswordVisible] = useState(false);
        const hasLabel = !title && !!label;

        const onChangeTextPlusLocalState = useCallback(
            (text: string) => {
                valueRef.current = text;
                onChangeText?.(text);
            },
            [onChangeText, valueRef],
        );

        useEffect(() => {
            // This hook will save initial values to the upper level ref
            onChangeTextPlusLocalState(initialValue?.toString() ?? '');
        }, [initialValue]); // eslint-disable-line react-hooks/exhaustive-deps

        const { memoizedStyles, inputStyle } = useMemo(() => {
            const allStyles = StyleSheet.create({
                container: {
                    marginTop: hasLabel ? PADDING : 0,
                    marginBottom: hasLabel ? PADDING / 2 : 0,
                    ...(onPressAddMessage ? {} : style),
                },
                inputContainer: {
                    backgroundColor: COLORS.black,
                    borderRadius: DEFAULT_BORDER_RADIUS,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: !multiline ? 'center' : 'flex-start',
                    borderWidth: DEFAULT_BORDER_WIDTH,
                    borderColor: isFocused
                        ? inputContainerStyle?.borderColorFocused
                            ? inputContainerStyle?.borderColorFocused
                            : COLORS.primary
                        : inputContainerStyle?.borderColorNotFocused
                            ? inputContainerStyle?.borderColorNotFocused
                            : DEFAULT_BORDER_COLOR,
                },
                input: {
                    height: multiline
                        ? height(12)
                        : FONT_SIZES.md + PADDING * 2,
                    paddingVertical: multiline ? PADDING : undefined,
                    flex: 1,
                    paddingHorizontal: PADDING,
                    borderRadius: DEFAULT_BORDER_RADIUS,
                    fontSize: FONT_SIZES.md,
                    color: COLORS.white,
                    fontFamily: FONT_FAMILIES.PRIMARY,
                },
                chatInput: {
                    height: undefined,
                    maxHeight: FONT_SIZES.md * 7,
                    minHeight: FONT_SIZES.md * 2,
                },
            });
            const theStyles: TextStyle = StyleSheet.flatten([
                allStyles.input,
                textInputStyle,
                submitBehavior === 'newline' ? allStyles.chatInput : {},
            ]);
            const inputStyle = {
                ...theStyles,
                fontSize: theStyles?.fontSize ?? FONT_SIZES.md,
            };
            return {
                memoizedStyles: allStyles,
                inputStyle,
            };
        }, [
            multiline,
            isFocused,
            hasLabel,
            style,
            onPressAddMessage,
            inputContainerStyle,
            textInputStyle,
            submitBehavior,
        ]);

        const onBlurCallback = () => {
            setIsFocused(false);
            onBlur?.(valueRef.current ?? '');
        };

        const onFocusCallback = () => {
            setIsFocused(true);
            onFocus?.();
        };

        const theValue = onPressAddMessage ? valueRef.current : formattedText;

        useEffect(() => {
            // This setTimeout is a workaround for a react-native bug where these props do not get set when multiline={true}
            // If this is not set, then the multiline cursor color will be the default color and not the one set in the props.
            // For example: this is needed on the chat screen, where multiline is true.
            setTimeout(() => {
                inputRef.current?.setNativeProps?.(TEXT_INPUT_COLORS);
            }, 1);
        }, []);

        return (
            <View style={memoizedStyles.container}>
                {!!title && <CustomLabel title={title} />}
                {hasLabel && (
                    <CustomLabel
                        color={COLORS.white}
                        informationIconText={labelInformationIconText}
                        title={label}
                    />
                )}
                <View style={memoizedStyles.inputContainer}>
                    <TextInput
                        autoCapitalize={autoCapitalize || 'sentences'}
                        autoCorrect={autoCorrect ?? false}
                        autoFocus={autoFocus}
                        defaultValue={
                            theValue
                                ? undefined
                                : defaultValueRef?.current ?? ''
                        }
                        editable={isEditable}
                        inputAccessoryViewID={inputAccessoryViewID}
                        keyboardType={keyboardType}
                        maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                        maxLength={maxLength}
                        multiline={multiline}
                        onBlur={onBlurCallback}
                        onChangeText={onChangeTextPlusLocalState}
                        onFocus={onFocusCallback}
                        onSubmitEditing={onSubmitEditing}
                        placeholder={placeholder || `Enter your ${id}`}
                        ref={inputRef}
                        returnKeyType={returnKeyType}
                        secureTextEntry={
                            isPasswordField
                                ? passwordVisible
                                    ? false
                                    : true
                                : false
                        }
                        style={inputStyle}
                        submitBehavior={submitBehavior}
                        value={theValue}
                        {...TEXT_INPUT_COLORS}
                    />
                    {isPasswordField && (
                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!passwordVisible)}
                            style={styles.icon}
                        >
                            <Feather
                                color={COLORS.white}
                                name={passwordVisible ? 'eye-off' : 'eye'}
                                size={FONT_SIZES['xl']}
                            />
                        </TouchableOpacity>
                    )}
                    {!!hasValue && onPressAddMessage && (
                        <CustomButton
                            onPress={() => {
                                onPressAddMessage();
                                onChangeTextPlusLocalState('');
                            }}
                            style={styles.sendMessageContainer}
                        >
                            <CustomText
                                color={COLORS.black}
                                fontFamily={FONT_FAMILIES.BOLD}
                            >
                                {'Send'}
                            </CustomText>
                        </CustomButton>
                    )}
                </View>
                {errorMessage ? (
                    <CustomText color={COLORS.red}>{errorMessage}</CustomText>
                ) : null}
            </View>
        );
    },
);

const styles = StyleSheet.create({
    label: {
        marginBottom: size(8),
        color: COLORS.white,
        fontFamily: FONT_FAMILIES.PRIMARY,
    },
    icon: {
        paddingHorizontal: PADDING,
    },
    sendMessageContainer: {
        backgroundColor: COLORS.primary08,
        borderRadius: DEFAULT_BORDER_RADIUS,
        marginHorizontal: size(5),
        alignSelf: 'flex-end',
        margin: PADDING / 2,
    },
});

CustomTextInput.displayName = 'CustomTextInput';
