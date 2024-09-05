import { Group, Divider, Container } from '@mantine/core';
import { Logo } from './Logo';
import { Network } from './Network';

export const Header = () => {
  return (
    <>
      <Container size="lg">
        <Group justify="space-between" mt="md" mb="md">
          <Logo></Logo>
          <Network></Network>
        </Group>
      </Container>

      <Divider mt="md" mb="md" />
    </>
  );
};
