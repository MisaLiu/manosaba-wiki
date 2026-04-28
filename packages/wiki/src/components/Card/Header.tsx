
type CardHeaderProps = {
  title: string,
  subtitle?: string,
  icon?: string,
};

// TODO: Subtitle and icon
export const CardHeader = ({
  title
}: CardHeaderProps) => {
  return (
    <div class="pb-2">
      <div>
        <div class="text-xl">{title}</div>
      </div>
    </div>
  )
};