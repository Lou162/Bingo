// features/profile/components/EditProfileModal.tsx
import React from "react";
import { Modal, View, Text, Button } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onValidate: () => void;
  onReject: () => void;
};

export function EditProfileModal({
  visible,
  onClose,
  onValidate,
  onReject,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
          <Text>Validate choice</Text>
          <Text>Are you sure you want to validate this choice?</Text>
          {/* Inputs ici */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}>
            <Button
              title='Save'
              onPress={() => onValidate()}
            />
            <Button
              title='Reject'
              onPress={() => onReject()}
            />
            <Button
              title='Cancel'
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
